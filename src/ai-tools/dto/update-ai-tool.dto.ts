import { PartialType } from '@nestjs/swagger';
import { CreateAiToolDto } from './create-ai-tool.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAiToolDto extends PartialType(CreateAiToolDto) {
  @ApiPropertyOptional({
    description: 'Updated message content',
    example: 'Eu gosto de estudar inglês diariamente.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Updated target language',
    example: 'es',
  })
  @IsOptional()
  @IsString()
  targetLang?: string;
}
