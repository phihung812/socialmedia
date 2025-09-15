import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum UserAccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  DEVELOPER = 'developer',
}

export class UsersSearchRequestDto {
  @ApiProperty({
    required: false,
    description: 'Search query for username, fullName, bio or location',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by user verification status',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isVerified?: boolean;

  @ApiProperty({
    required: false,
    description: 'Filter by user private status',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPrivate?: boolean;

  @ApiProperty({
    required: false,
    enum: UserAccountStatus,
    description: 'Filter by account status',
  })
  @IsOptional()
  @IsEnum(UserAccountStatus)
  accountStatus?: UserAccountStatus;

  @ApiProperty({
    required: false,
    description: 'Filter by location country',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by location city',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by minimum follower count',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minFollowers?: number;

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
    enum: ['username', 'fullName', 'createdAt', 'followerCount', 'postCount'],
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

  @ApiProperty({
    required: false,
    enum: UserRole,
    description: 'Filter by user role',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    required: false,
    description: 'Filter by email',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
