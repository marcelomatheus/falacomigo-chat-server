import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'The provided email is invalid.' })
  @IsNotEmpty({ message: 'The email field cannot be empty.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'The password field cannot be empty.' })
  @MinLength(8, { message: 'The password must be at least 8 characters long.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'The name field cannot be empty.' })
  name: string;
}
