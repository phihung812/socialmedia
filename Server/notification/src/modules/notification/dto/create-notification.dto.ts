import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateNotificationDto {
  @IsMongoId()
  @IsNotEmpty()
  receiverId?: string;

  @IsMongoId()
  @IsNotEmpty()
  senderId: string;

  @IsEnum(['like', 'comment', 'follow', 'mention', 'tag'])
  type: 'like' | 'comment' | 'reply' | 'follow' | 'mention' | 'tag';

  @IsEnum(['post', 'comment', 'user'])
  entityType: 'post' | 'comment' | 'user';

  @IsMongoId()
  @IsNotEmpty()
  referenceId: string;

  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsNotEmpty()
  url?: string;

}
