import { Controller, Post, Body } from '@nestjs/common';
import { AiToolsService } from './ai-tools.service';
import { InterpretMessageDto } from './dto/interpret-message.dto';

@Controller('ai-tools')
export class AiToolsController {
  constructor(private readonly aiToolsService: AiToolsService) {}

  @Post('interpret')
  interpretMessage(@Body() interpretMessageDto: InterpretMessageDto) {
    return this.aiToolsService.interpretMessage(interpretMessageDto);
  }
}
