import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email to receive password reset link',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;
}
