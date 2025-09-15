import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  ValidateNested,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImageDto {
  @IsOptional()
  @IsUrl()
  image_url: string;

  @IsOptional()
  @IsString()
  image_public_id?: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  altText?: string;
}

class CoordinatesDto {
  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;
}

class LocationDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
}

class StatisticsDto {
  @IsOptional()
  @IsNumber()
  likeCount?: number;

  @IsOptional()
  @IsNumber()
  commentCount?: number;
}

class AuthorDto {
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  role?: string;

}

export enum PrivacySetting {
  JUST_ME = 'just me',
  PUBLIC = 'public',
  FRIEND = 'friend',
}

export class CreatePostDto {
  @IsOptional()
  @IsMongoId()
  userId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AuthorDto)
  author?: AuthorDto;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];

  @IsEnum(PrivacySetting)
  @IsOptional()
  privacy: PrivacySetting = PrivacySetting.PUBLIC;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StatisticsDto)
  statistics?: StatisticsDto;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  mentionedUsers?: string[];
}
