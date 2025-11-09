import { IsOptional, IsString } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  @IsString()
  email?: string;
}
