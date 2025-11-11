import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAiToolDto {
  @ApiProperty({
    description: 'Original message content to process',
    example: 'Eu gosto de aprender inglês.',
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
    description: 'Chat id reference',
    example: '64f1c2a1e9b1a2b3c4d5e6f8',
  })
  @IsString()
  chatId!: string;

  @ApiPropertyOptional({
    description: 'Target language for translation',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  targetLang?: string;
}
