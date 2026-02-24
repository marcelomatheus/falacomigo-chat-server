import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SocketStoreService } from '@/socket-store/socket-store.service';
import { WsJwtAuthGuard } from '@/auth/guards/ws-jwt-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthenticatedSocket } from './interfaces/authenticated-socket.interface';
import { JwtPayload } from '@/auth/types/jwt-payload-type';
import { EncryptionService } from '@/common/security/encryption.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly socketStoreService: SocketStoreService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {}

  afterInit() {
    console.info('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user) {
        this.emitError(client, 'User not found');
        client.disconnect();
        return;
      }

      if (!user.profile) {
        try {
          const newProfile = await this.prisma.profile.create({
            data: {
              name: user.email.split('@')[0],
              userId: user.id,
              tokensBalance: 30,
            },
          });

          user.profile = newProfile;
        } catch (_profileError) {
          this.emitError(
            client,
            'User profile not found and could not be created',
          );
          client.disconnect();
          return;
        }
      }

      await this.socketStoreService.saveSocket(user.profile.id, client.id);
      const lastMessageCreatedAt = client.handshake.query
        .lastMessageCreatedAt as string;
      let since: Date | undefined;
      if (lastMessageCreatedAt) {
        const parsed = new Date(lastMessageCreatedAt);
        if (!isNaN(parsed.getTime())) {
          since = parsed;
        }
      }
      const messages = await this.chatService.getMessagesSince(
        user.profile.id,
        since,
      );
      const BATCH_SIZE = 20;
      for (let i = 0; i < messages.length; i += BATCH_SIZE) {
        const batch = messages.slice(i, i + BATCH_SIZE);

        client.emit('missedMessages', batch);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      client.emit('syncComplete', { total: messages.length });

      const authClient = client as AuthenticatedSocket;
      authClient.data.user = payload;
      authClient.data.profileId = user.profile.id;
    } catch (_error) {
      this.emitError(client, 'Authentication failed');
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const authClient = client as AuthenticatedSocket;
    if (authClient.data.profileId) {
      await this.socketStoreService.removeSocket(authClient.data.profileId);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessageDto,
  ) {
    try {
      const senderId = client.data.profileId;

      const recipientId = payload.recipientId;
      let chatId = payload.chatId;
      const clientRequestId = payload.clientRequestId ?? null;

      if (!chatId && (!recipientId || typeof recipientId !== 'string')) {
        this.emitError(
          client,
          'Recipient profile ID is required when chatId is missing',
          {
            clientRequestId,
            chatId: chatId ?? null,
          },
        );
        return;
      }

      if (!chatId && recipientId) {
        const existingChat = await this.prisma.chat.findFirst({
          where: {
            isGroup: false,
            AND: [
              { participantIds: { has: senderId } },
              { participantIds: { has: recipientId } },
            ],
          },
        });

        if (existingChat) {
          chatId = existingChat.id;
        } else {
          const newChat = await this.prisma.chat.create({
            data: {
              participantIds: [senderId, recipientId],
              isGroup: false,
            },
          });
          chatId = newChat.id;

          await this.prisma.profile.update({
            where: { id: senderId },
            data: {
              chatIds: { push: chatId },
            },
          });

          await this.prisma.profile.update({
            where: { id: recipientId },
            data: {
              chatIds: { push: chatId },
            },
          });
        }
      }
      const chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
      });
      if (!chat || !chat.participantIds.includes(senderId)) {
        this.emitError(client, 'Chat not found or unauthorized', {
          clientRequestId,
          chatId,
        });
        return;
      }
      const encryptedContent = this.encryptionService.encrypt(payload.content);
      const queueJob = await this.messageQueue
        .add(
          'message-job',
          {
            chatId,
            senderId,
            recipientId,
            content: encryptedContent,
            participantIds: chat.participantIds,
            clientRequestId: payload.clientRequestId,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          },
        )
        .catch((err) => {
          console.error('Error adding message to queue:', err);
          throw err;
        });
      if (!queueJob) {
        this.emitError(client, 'Failed to queue message', {
          clientRequestId,
          chatId,
        });
        return;
      }

      client.emit('messageSent', {
        success: true,
        chatId,
        clientRequestId,
      });
    } catch (_error) {
      this.emitError(client, 'Failed to send message', {
        clientRequestId: payload?.clientRequestId ?? null,
        chatId: payload?.chatId ?? null,
      });
    }
  }

  private extractToken(client: Socket): string | undefined {
    const [type, token] =
      client.handshake.headers.authorization?.split(' ') ?? [];

    const extractedToken =
      type === 'Bearer' ? token : (client.handshake.auth.token as string);

    return extractedToken;
  }

  private emitError(
    client: Socket,
    message: string,
    context?: { clientRequestId?: string | null; chatId?: string | null },
  ) {
    client.emit('error', {
      error: message,
      clientRequestId: context?.clientRequestId ?? null,
      chatId: context?.chatId ?? null,
    });
  }
}
