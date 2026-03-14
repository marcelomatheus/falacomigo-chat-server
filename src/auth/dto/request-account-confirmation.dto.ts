import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestAccountConfirmationDto {
  @ApiProperty({
    description: 'Email address for confirmation code delivery',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;
}
