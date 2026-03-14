import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { EmailService } from '@/email/email.service';
import { mailgunProvider } from '@/email/email.provider';
import { EmailProcessor } from '@/email/email.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  providers: [mailgunProvider, EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
