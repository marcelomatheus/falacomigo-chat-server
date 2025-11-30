import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';
import {
  CorrectionSuggestions,
  TranslationType,
} from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message textual content',
    example: 'Olá, tudo bem?',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    description: 'Sender profile id',
    example: '64f1c2a1e9b1a2b3c4d5e6f7',
  })
  @IsString()
  senderId!: string;

  @ApiProperty({
    description: 'Chat id this message belongs to',
    example: '64f1c2a1e9b1a2b3c4d5e6f8',
  })
  @IsString()
  chatId!: string;

  @ApiPropertyOptional({
    description: 'Optional pre-generated translation JSON',
    example: {
      detectedLang: 'pt',
      targetLang: 'en',
      text: 'Hello, how are you?',
    },
  })
  @IsOptional()
  translation?: TranslationType;

  @ApiPropertyOptional({
    description: 'Optional correction suggestions JSON',
    example: { suggestions: ['Olá, tudo bem?'] },
  })
  @IsOptional()
  correctionSuggestions?: CorrectionSuggestions;
}
