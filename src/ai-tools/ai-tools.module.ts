import { Module } from '@nestjs/common';
import { AiToolsService } from './ai-tools.service';
import { AiToolsController } from './ai-tools.controller';
import { GroqModule } from '@/groq/groq.module';
import { ProfileModule } from '@/profile/profile.module';
import { MessageModule } from '@/message/message.module';

@Module({
  imports: [GroqModule, ProfileModule, MessageModule],
  controllers: [AiToolsController],
  providers: [AiToolsService],
})
export class AiToolsModule {}
