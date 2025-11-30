import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class CreateDeepCorrectionsDto {
  @ApiProperty({
    description: 'Title of deep correction',
    example: 'Simple past',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Explanation of the topic',
    example: 'Simple presente é um tempo verbal em inglês...',
  })
  @IsString()
  explanation!: string;

  @ApiProperty({
    description: 'Example of the topic',
    example: 'I worked yesterday',
  })
  @IsString()
  example!: string;

  @ApiProperty({
    description: 'Profile id',
    example: '64f1c2a1e9b1a2b3c4d5e6f7',
  })
  @IsString()
  profileId!: string;

  @ApiProperty({
    description: 'Message id',
    example: '64f1c2a1e9b1a2b3c4d5e6f7',
  })
  @IsString()
  messageId!: string;

  @ApiProperty({
    description: 'Target language for this apprenticeship',
    example: 'English',
  })
  @IsString()
  targetLanguage!: string;
}
