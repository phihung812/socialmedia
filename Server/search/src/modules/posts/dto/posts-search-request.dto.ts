import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PostsSearchRequestDto {
  @ApiProperty({ required: false, description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by tags',
    type: [String],
  })
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, description: 'Filter by author ID' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiProperty({
    required: false,
    default: 0,
    description: 'Number of results to skip',
  })

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  from?: number = 0;

  @ApiProperty({
    required: false,
    default: 10,
    description: 'Number of results to return',
  })

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  size?: number = 10;

  @ApiProperty({
    required: false,
    default: 'createdAt',
    description: 'Field to sort by',
  })

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    required: false,
    default: 'desc',
    enum: SortOrder,
    description: 'Sort order',
  })

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
