import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FilterMessageDto {
  @ApiPropertyOptional({
    description: 'Text search on message content',
    example: 'olá',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by chat id',
    example: '64f1c2a1e9b1a2b3c4d5e6f8',
  })
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiPropertyOptional({
    description: 'Filter by sender profile id',
    example: '64f1c2a1e9b1a2b3c4d5e6f7',
  })
  @IsOptional()
  @IsString()
  senderId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
    example: 20,
  })
  @IsOptional()
  @IsString()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Order by field',
    enum: ['createdAt', 'updatedAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  orderBy?: 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Started from date (ISO string)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  gt?: Date;
}
