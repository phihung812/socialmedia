import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SearchResult } from '../../../shared/interfaces/search-result.interface';
import { PostDocument } from '../interfaces/post-document.interface';

export class PostSearchHit implements PostDocument {
  @ApiProperty({ description: 'Post ID' })
  id: string;

  @ApiProperty({ description: 'Post content' })
  content: string;

  @ApiProperty({ description: 'Author ID' })
  authorId: string;

  @ApiProperty({ description: 'Author Name' })
  authorName: string;

  @ApiProperty({ description: 'Post tags', type: [String], required: false })
  tags?: string[];

  @ApiProperty({ description: 'Created at', type: Date })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', type: Date, required: false })
  updatedAt?: Date;

  @ApiProperty({ description: 'Like count' })
  likeCount: number;

  @ApiProperty({ description: 'Comment count' })
  commentCount: number;

  @ApiProperty({
    description: 'Location coordinates',
    type: Object,
    required: false,
  })
  location?: {
    lat: number;
    lon: number;
  };

  @ApiProperty({ description: 'Search relevance score' })
  score: number;

  @ApiProperty({
    description: 'Highlighted fields',
    type: Object,
    required: false,
  })
  highlights?: Record<string, string[]>;
}

export class PostsSearchMetadata {
  @ApiProperty({ description: 'Total number of matching posts' })
  total: number;

  @ApiProperty({ description: 'Maximum score among search results' })
  maxScore: number;

  @ApiProperty({ description: 'Time taken for the search in milliseconds' })
  took: number;
}

export interface ImageDto {
  image_url: string;
  image_public_id: string;
  _id: string;
}

export interface AuthorDto {
  userId: string;
  username: string;
  fullName: string;
}

export interface StatisticsDto {
  likeCount: number;
  commentCount: number;
}

export class PostsSearchResponseDto implements SearchResult<PostDocument> {
  @ApiProperty({ description: 'Search results metadata' })
  @Type(() => PostsSearchMetadata)
  meta: PostsSearchMetadata;

  @ApiProperty({
    description: 'Array of matching posts',
    type: [PostSearchHit],
  })
  @Type(() => PostSearchHit)
  hits: PostSearchHit[];

  @ApiProperty({
    description: 'Aggregated data from search results',
    type: Object,
  })
  aggregations?: Record<string, any>;

  @ApiProperty({
    description: 'Suggestions for alternative search terms',
    type: Object,
  })
  suggestions?: Record<string, any[]>;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [Object] })
  posts: {
    id: string;
    score?: number;
    [key: string]: any;
  }[];
}

export class PostsSuggestionsResponse {
  @ApiProperty({ description: 'Post title suggestions', type: [String] })
  titleSuggestions: string[];

  @ApiProperty({ description: 'Post tag suggestions', type: [String] })
  tagSuggestions: string[];
}
