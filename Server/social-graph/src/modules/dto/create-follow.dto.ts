import { IsMongoId, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateFollowDto {
  @IsMongoId()
  followerId: string;

  @IsMongoId()
  followingId: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'accepted'])
  status?: string;
}
