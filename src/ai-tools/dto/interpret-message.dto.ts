import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InterpretMessageDto {
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
    description: 'Message id reference',
    example: '64f1c2a1e9b1a2b3c4d5e6f8',
  })
  @IsString()
  messageId!: string;
}
