import { IsMongoId, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLastMessageDto {
  @IsMongoId()
  senderId: string;

  @IsString()
  content: string;

  @Type(() => Date)
  createdAt: Date;
}
