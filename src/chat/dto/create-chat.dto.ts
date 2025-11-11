import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ArrayMinSize,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChatDto {
  @ApiPropertyOptional({ description: 'Chat name', example: 'Grupo do Inglês' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a group chat',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @ApiProperty({
    description: 'Participant profile ids',
    type: [String],
    example: ['64f1c2a1e9b1a2b3c4d5e6f7', '64f1c2a1e9b1a2b3c4d5e6f8'],
  })
  @IsArray()
  @ArrayMinSize(1)
  participantIds: string[];
}
