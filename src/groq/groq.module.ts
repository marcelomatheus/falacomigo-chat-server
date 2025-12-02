import { Module } from '@nestjs/common';
import { GroqService } from './groq.service';
import { GroqProvider } from './groq.provider';

@Module({
  providers: [GroqService, GroqProvider],
  exports: [GroqService],
})
export class GroqModule {}
