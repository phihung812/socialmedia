import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchEntityType {
  ALL = 'all',
  USERS = 'users',
  POSTS = 'posts',
  // COMMENTS = 'comments',
  // TAGS = 'tags',
}

export enum SearchSortOrder {
  RELEVANCE = 'relevance',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MOST_POPULAR = 'most_popular',
}

export class GlobalSearchRequestDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'elasticsearch',
    required: true,
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Types of entities to search',
    enum: SearchEntityType,
    default: SearchEntityType.ALL,
    isArray: true,
    example: [SearchEntityType.POSTS, SearchEntityType.USERS],
  })
  @IsOptional()
  @IsEnum(SearchEntityType, { each: true })
  @IsArray()
  entityTypes: SearchEntityType[] = [SearchEntityType.ALL];

  @ApiProperty({
    description: 'Sort order for search results',
    enum: SearchSortOrder,
    default: SearchSortOrder.RELEVANCE,
  })
  @IsOptional()
  @IsEnum(SearchSortOrder)
  sortOrder: SearchSortOrder = SearchSortOrder.RELEVANCE;

  @ApiProperty({
    description: 'Page number (1-based indexing)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({
    description: 'Number of results per page',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit: number = 10;

  @ApiProperty({
    description: 'Whether to include highlighted snippets in the response',
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  highlight?: boolean = true;

  @ApiProperty({
    description:
      'Filter results by creation date (ISO format, e.g., "2023-01-01")',
    example: '2023-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiProperty({
    description:
      'Filter results by creation date (ISO format, e.g., "2023-12-31")',
    example: '2023-12-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiProperty({
    description: 'Filter results by tags (comma-separated)',
    example: 'javascript,elasticsearch',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    required: false,
    default: 'createdAt',
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';
}
