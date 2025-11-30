import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsOptional()
  chatId?: string;

  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDateString()
  @IsNotEmpty()
  createdAt: string;

  @IsString()
  @IsOptional()
  clientRequestId?: string;
}
