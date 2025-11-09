import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ChatModule } from './chat/chat.module';
// import { SocketStoreModule } from './socket-store/socket-store.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ChatModule],
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
