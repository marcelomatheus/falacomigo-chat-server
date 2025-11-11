import { PartialType } from '@nestjs/mapped-types';
import { CreateChatDto } from './create-chat.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateChatDto extends PartialType(CreateChatDto) {
  @ApiPropertyOptional({
    description: 'Chat name',
    example: 'Bate-papo de Estudos',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a group chat',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @ApiPropertyOptional({
    description: 'Participant profile ids',
    type: [String],
    example: ['64f1c2a1e9b1a2b3c4d5e6f7'],
  })
  @IsOptional()
  @IsArray()
  participantIds?: string[];
}
