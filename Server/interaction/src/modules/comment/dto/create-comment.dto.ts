import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  postId: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  mentionedUsers?: string[];

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}
