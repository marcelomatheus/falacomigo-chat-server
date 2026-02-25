import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { ChatModule } from './chat/chat.module';
import { SocketStoreModule } from './socket-store/socket-store.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ProfileModule } from './profile/profile.module';
import { AiToolsModule } from './ai-tools/ai-tools.module';
import { MessageModule } from './message/message.module';
import { GroqModule } from './groq/groq.module';
import { DeepCorrectionsModule } from '@/deep-corrections/deep-corrections.module';
import { EncryptionModule } from '@/common/security/encryption.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST,
          password: process.env.REDIS_PASSWORD || undefined,
          port: 6379,
          db: Number(process.env.REDIS_DB) || 0,
        },
      }),
    }),
    SocketStoreModule,
    PrismaModule,
    UserModule,
    AuthModule,
    ChatModule,
    ProfileModule,
    AiToolsModule,
    MessageModule,
    GroqModule,
    DeepCorrectionsModule,
    EncryptionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
