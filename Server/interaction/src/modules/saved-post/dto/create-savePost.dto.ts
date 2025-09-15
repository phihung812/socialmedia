import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from "class-validator";

class ImageDto {
  @IsOptional()
  @IsUrl()
  image_url: string;

  @IsOptional()
  @IsString()
  image_public_id?: string;

  @IsOptional()
  @IsString()
  altText?: string;
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
}

export class CreateSavedPostDto {
  @IsNotEmpty()
  @IsMongoId()
  postId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  collectionName?: string = 'Default';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => StatisticsDto)
  statistics?: StatisticsDto;

}

