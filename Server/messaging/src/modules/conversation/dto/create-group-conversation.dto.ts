import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  ValidateNested,
} from 'class-validator';


export class ParticipantDetailDto {
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class CreateGroupConversationDto {
  @IsBoolean()
  isGroup: true;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsMongoId()
  creatorId: string;

  @IsArray()
  @IsMongoId({ each: true })
  participantIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDetailDto)
  participantDetails: ParticipantDetailDto[];
}

export class CreateConversationDto {
  @IsBoolean()
  isGroup: false;

  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsMongoId()
  creatorId?: string;

  @IsArray()
  @IsMongoId({ each: true })
  participantIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDetailDto)
  participantDetails: ParticipantDetailDto[];
}
