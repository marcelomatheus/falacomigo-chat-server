import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtPayload } from '@/auth/types/jwt-payload-type';
import { AuthenticatedSocket } from '@/chat/interfaces/authenticated-socket.interface';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = payload;

      const chatId =
        (client.handshake.query.chatId as string) ||
        (client.handshake.auth.chatId as string);

      if (chatId) {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          include: { profile: true },
        });

        if (!user || !user.profile) {
          throw new WsException('User profile not found');
        }

        const hasChat = await this.prisma.profile.findFirst({
          where: {
            id: user.profile.id,
            chatIds: {
              has: chatId,
            },
          },
        });

        if (!hasChat) {
          throw new WsException('User does not belong to this chat');
        }

        client.data.profileId = user.profile.id;
      }
      return true;
    } catch (_) {
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: Socket): string | undefined {
    const [type, token] =
      client.handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : (client.handshake.auth.token as string);
  }
}
