import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FilterProfileDto {
  @ApiPropertyOptional({ description: 'Text search on name', example: 'Maria' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Learning language filter',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  learningLang?: string;

  @ApiPropertyOptional({ description: 'Learning level filter', example: 'A2' })
  @IsOptional()
  @IsString()
  learningLevel?: string;

  @ApiPropertyOptional({
    description: 'Known languages (comma separated)',
    example: 'pt,en,es',
  })
  @IsOptional()
  @IsString()
  knownLanguages?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Order by field',
    enum: ['createdAt', 'updatedAt', 'name'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'name'])
  orderBy?: 'createdAt' | 'updatedAt' | 'name' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'desc';
}
