import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class VerifyAccountConfirmationDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: '6-digit confirmation code',
    example: '123456',
  })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
