import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchEmailDto {
  @ApiPropertyOptional({
    description: 'Filter by recipient address',
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  recipient?: string;

  @ApiPropertyOptional({
    description: 'Filter by event type (accepted, delivered, failed, etc.)',
    example: 'delivered',
  })
  @IsString()
  @IsOptional()
  event?: string;

  @ApiPropertyOptional({
    description: 'Pagination limit for Mailgun events',
    example: 20,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
