import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'User email address to register',
    example: 'newuser@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Account password (min 8 chars recommended)',
    example: 'MyN3wP@ss',
  })
  @IsString()
  password: string;
}
