import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { EncryptionModule } from '@/common/security/encryption.module';

@Module({
  imports: [PrismaModule, EncryptionModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
