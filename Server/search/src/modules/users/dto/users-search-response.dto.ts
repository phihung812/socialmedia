import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SearchResult } from '../../../shared/interfaces/search-result.interface';
import { UserDocument } from '../interfaces/user-document.interface';

export class UserSearchHit implements UserDocument {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Full name', required: false })
  fullName?: string;

  @ApiProperty({ description: 'User bio', required: false })
  bio?: string;

  @ApiProperty({
    description: 'Avatar information',
    type: Object,
    required: false,
  })
  avatar?: {
    avatar_url?: string;
    avatar_public_id?: string;
  };

  @ApiProperty({ description: 'Is profile private' })
  isPrivate: boolean;

  @ApiProperty({ description: 'Is user verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Gender', required: false })
  gender?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  website?: string;

  @ApiProperty({
    description: 'User location',
    type: Object,
    required: false,
  })
  location?: {
    country?: string;
    city?: string;
  };

  @ApiProperty({
    description: 'User statistics',
    type: Object,
  })
  statistics: {
    postCount: number;
    followerCount: number;
    followingCount: number;
  };

  @ApiProperty({ description: 'Last active date', type: Date, required: false })
  lastActive?: Date;

  @ApiProperty({ description: 'Account status' })
  accountStatus: string;

  @ApiProperty({ description: 'Created at', type: Date })
  createdAt: Date;

  @ApiProperty({ description: 'Search relevance score' })
  score: number;

  @ApiProperty({
    description: 'Highlighted fields',
    type: Object,
    required: false,
  })
  highlights?: Record<string, string[]>;
}

export class UsersSearchMetadata {
  @ApiProperty({ description: 'Total number of matching users' })
  total: number;

  @ApiProperty({ description: 'Maximum score among search results' })
  maxScore: number;

  @ApiProperty({ description: 'Time taken for the search in milliseconds' })
  took: number;
}

export class UsersSearchResponseDto implements SearchResult<UserDocument> {
  @ApiProperty({ description: 'Search results metadata' })
  @Type(() => UsersSearchMetadata)
  meta: UsersSearchMetadata;

  @ApiProperty({
    description: 'Array of matching users',
    type: [UserSearchHit],
  })
  @Type(() => UserSearchHit)
  hits: UserSearchHit[];

  @ApiProperty({
    description: 'Aggregated data from search results',
    type: Object,
    required: false
  })
  aggregations?: Record<string, any>;

  @ApiProperty({
    description: 'Suggestions for alternative search terms',
    type: Object,
    required: false
  })
  suggestions?: Record<string, any[]>;

  // @ApiProperty({ description: 'Total number of matching users' })
  // total: number;

  // @ApiProperty({ 
  //   description: 'List of found users',
  //   type: [Object] 
  // }) 
  // users: {
  //   id: string;
  //   username: string;
  //   score?: number;
  //   [key: string]: any;
  // }[];
}

export class UsersSuggestionsResponse {
  @ApiProperty({ description: 'Username suggestions', type: [String] })
  usernameSuggestions: string[];

  @ApiProperty({ description: 'Full name suggestions', type: [String] })
  fullNameSuggestions: string[];

  @ApiProperty({ description: 'Location suggestions', type: [String] })
  locationSuggestions: string[];
}