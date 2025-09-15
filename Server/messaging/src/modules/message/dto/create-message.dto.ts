import { IsMongoId, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsMongoId()
  senderId: string;

  @IsString()
  senderUsername?: string;

  @IsString()
  senderFullName?: string;

  @IsString()
  senderAvatar?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(['text', 'image', 'video', 'audio'])
  contentType?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}



