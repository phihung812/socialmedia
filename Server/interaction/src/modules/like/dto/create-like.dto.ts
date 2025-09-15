import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateLikeDto {
  @IsNotEmpty()
  @IsMongoId()
  postId: string;

  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
