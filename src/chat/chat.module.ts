import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatProcessor } from './chat.processor';
import { ChatController } from './chat.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { SocketStoreModule } from '@/socket-store/socket-store.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    SocketStoreModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'message-queue',
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatProcessor],
  exports: [ChatService],
})
export class ChatModule {}
