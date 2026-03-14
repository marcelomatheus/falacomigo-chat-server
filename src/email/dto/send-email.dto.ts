import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Recipient email list',
    example: ['user@example.com'],
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  to!: string[];

  @ApiProperty({
    description: 'Email subject',
    example: 'Confirm your account',
  })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    description: 'HTML content',
    example: '<h1>Hello</h1>',
  })
  @IsString()
  @IsNotEmpty()
  html!: string;

  @ApiPropertyOptional({
    description: 'Optional text fallback',
    example: 'Hello',
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({
    description: 'Optional from override',
    example: 'Fala Comigo <no-reply@mg.falacomigo.space>',
  })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'Optional tags',
    type: [String],
    example: ['auth', 'confirm-account'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
