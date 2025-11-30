import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ description: 'Display name', example: 'Maria Silva' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Photo URL',
    nullable: true,
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsString()
  photoUrl?: string | null;

  @ApiProperty({
    description: 'Linked user id',
    example: '64f1c2a1e9b1a2b3c4d5e6f1',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Initial tokens balance',
    default: 0,
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  tokensBalance: number;

  @ApiProperty({ description: 'Learning language (ISO code)', example: 'en' })
  @IsString()
  @IsOptional()
  learningLang?: string;

  @ApiProperty({ description: 'Learning level e.g. A1, B2', example: 'B1' })
  @IsString()
  @IsOptional()
  learningLevel?: string;

  @ApiPropertyOptional({
    description: 'Known languages',
    type: [String],
    example: ['pt', 'es'],
  })
  @IsOptional()
  @IsArray()
  knownLanguages?: string[];

  @ApiPropertyOptional({
    description: 'Associated chat ids',
    type: [String],
    example: ['64f1c2a1e9b1a2b3c4d5e6f7'],
  })
  @IsOptional()
  @IsArray()
  chatIds?: string[];
}
