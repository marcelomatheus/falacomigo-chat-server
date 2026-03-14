import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ConfirmPasswordResetDto {
  @ApiProperty({
    description: 'JWT token received by email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'New account password',
    example: 'StrongP@ssw0rd123',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
