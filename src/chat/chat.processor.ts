import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SocketStoreService } from '@/socket-store/socket-store.service';
import { ChatGateway } from './chat.gateway';
import { ChatJobData } from './interfaces/chat-job.interface';
import { MessageWithSender } from './interfaces/message-with-sender.interface';
@Injectable()
@Processor('message-queue')
export class ChatProcessor extends WorkerHost {
  private readonly logger = new Logger(ChatProcessor.name);
  constructor(
    private readonly chatService: ChatService,
    private readonly socketStoreService: SocketStoreService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {
    super();
    this.logger.log('ChatProcessor initialized');
  }

  async process(
    job: Job<ChatJobData, MessageWithSender, string>,
  ): Promise<void> {
    if (job.name !== 'message-job') {
      this.logger.warn(`Job ignored: ${job.name}`);
      return;
    }
    const jobData = this.ensureJobData(job.data);
    const { chatId, senderId, content, recipientId, clientRequestId } = jobData;
    const participantIds = jobData.participantIds;

    try {
      const message = await this.chatService.createMessage({
        chatId,
        senderId,
        content,
      });

      const enrichedMessage: MessageWithSender & {
        clientRequestId?: string;
      } = {
        ...message,
        clientRequestId,
      };

      const targets = new Set<string>(participantIds);
      if (recipientId) {
        targets.add(recipientId);
      }
      targets.add(senderId);

      await Promise.all(
        Array.from(targets).map(async (profileId) => {
          const socketId = await this.socketStoreService.getSocket(profileId);
          if (socketId && this.chatGateway.server) {
            this.chatGateway.server
              .to(socketId)
              .emit('newMessage', enrichedMessage);
          }
        }),
      );

      return;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }
  private ensureJobData(payload: unknown): ChatJobData {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid job payload');
    }

    const data = payload as Partial<ChatJobData>;
    if (
      typeof data.chatId !== 'string' ||
      typeof data.senderId !== 'string' ||
      typeof data.content !== 'string' ||
      !Array.isArray(data.participantIds)
    ) {
      throw new Error('Malformed job payload');
    }

    return data as ChatJobData;
  }
}
