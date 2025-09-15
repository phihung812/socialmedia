import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationMeta } from '../../../shared/interfaces/search-result.interface';
import { SearchEntityType } from './global-search-request.dto';

export class SearchHitBase {
  @ApiProperty({ description: 'Entity ID' })
  id: string;

  @ApiProperty({
    description: 'Entity type',
    enum: SearchEntityType,
    enumName: 'SearchEntityType',
  })
  entityType: SearchEntityType;

  @ApiProperty({ description: 'Search relevance score' })
  score: number;

  @ApiProperty({ description: 'Creation date', type: Date })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', type: Date })
  updatedAt: Date;
}

export class Statistics {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export class Avatar {
  avatar_url: number;
  avatar_public_id: number;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export class UserSearchHit extends SearchHitBase {
  @ApiProperty({ description: 'User name' })
  username: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Avatar url' })
  avatar: Avatar;

  @ApiProperty({ description: 'Role of the user', enum: Role })
  role: Role;

  @ApiProperty({ description: 'isPrivate' })
  isPrivate: boolean;

  @ApiProperty({ description: 'isVerified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Statistics' })
  statistics: Statistics;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'phoneNumber' })
  phoneNumber: string;

  @ApiProperty({ description: 'User profile image URL', required: false })
  profileImage?: string;

  @ApiProperty({ description: 'User bio', required: false })
  bio?: string;

  @ApiProperty({
    description: 'Highlighted content',
    type: Object,
    required: false,
  })
  highlights?: {
    name?: string[];
    bio?: string[];
  };
}

export interface PostImage {
  image_url: string;
  image_public_id: string;
}

export interface Statistics {
  likeCount: number;
  commentCount: number;
}

export interface Author {
  userId: string;
  username: string;
  fullName: string;
}

export class PostSearchHit extends SearchHitBase {
  _id: string;

  @ApiProperty({ description: 'Post title' })
  title: string;

  @ApiProperty({ description: 'Post content preview' })
  contentPreview: string;

  @ApiProperty({ description: 'Post author full name' })
  author: Author;

  @ApiProperty({ description: 'Post user be tag' })
  mentionedUsers: string[];

  @ApiProperty({ description: 'Post status privacy' })
  privacy: string;

  @ApiProperty({ description: 'Post image public id' })
  images: PostImage[];

  @ApiProperty({ description: 'Post commentCount' })
  statistics: Statistics;

  @ApiProperty({ description: 'Post tags', type: [String] })
  tags: string[];

  @ApiProperty({ description: 'Post caption', type: [String] })
  caption: string[];

  @ApiProperty({
    description: 'Highlighted content',
    type: Object,
    required: false,
  })
  highlights?: {
    title?: string[];
    contentPreview?: string[];
    tags?: string[];
  };
}

export class CommentSearchHit extends SearchHitBase {
  @ApiProperty({ description: 'Comment content preview' })
  contentPreview: string;

  @ApiProperty({ description: 'Related post ID' })
  postId: string;

  @ApiProperty({ description: 'Related post title' })
  postTitle: string;

  @ApiProperty({ description: 'Comment author ID' })
  authorId: string;

  @ApiProperty({ description: 'Comment author name' })
  authorName: string;

  @ApiProperty({
    description: 'Highlighted content',
    type: Object,
    required: false,
  })
  highlights?: {
    contentPreview?: string[];
  };
}

export class TagSearchHit extends SearchHitBase {
  @ApiProperty({ description: 'Tag name' })
  name: string;

  @ApiProperty({ description: 'Tag description' })
  description: string;

  @ApiProperty({ description: 'Number of posts with this tag' })
  count: number;

  @ApiProperty({
    description: 'Highlighted content',
    type: Object,
    required: false,
  })
  highlights?: {
    name?: string[];
    description?: string[];
  };
}

export class GlobalSearchMetadata {
  @ApiProperty({ description: 'Total number of matching results' })
  total: number;

  @ApiProperty({ description: 'Time taken for the search in milliseconds' })
  took: number;

  @ApiProperty({ description: 'Count of results by entity type', type: Object })
  counts: {
    [SearchEntityType.USERS]?: number;
    [SearchEntityType.POSTS]?: number;
    // [SearchEntityType.COMMENTS]?: number;
    // [SearchEntityType.TAGS]?: number;
  };
}

export class PaginationDto implements PaginationMeta {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Total number of items' })
  totalItems: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class GlobalSearchResponse {
  @ApiProperty({ description: 'Search metadata' })
  @Type(() => GlobalSearchMetadata)
  meta: GlobalSearchMetadata;

  @ApiProperty({ description: 'Pagination information' })
  @Type(() => PaginationDto)
  pagination: PaginationDto;

  @ApiProperty({ description: 'User search results', type: [UserSearchHit] })
  @Type(() => UserSearchHit)
  users: UserSearchHit[];

  @ApiProperty({ description: 'Post search results', type: [PostSearchHit] })
  @Type(() => PostSearchHit)
  posts: PostSearchHit[];

  @ApiProperty({
    description: 'Comment search results',
    type: [CommentSearchHit],
  })
  @Type(() => CommentSearchHit)
  comments: CommentSearchHit[];

  @ApiProperty({ description: 'Tag search results', type: [TagSearchHit] })
  @Type(() => TagSearchHit)
  tags: TagSearchHit[];

  @ApiProperty({
    description: 'Search query suggestions',
    type: [String],
    required: false,
  })
  suggestions?: string[];
}


