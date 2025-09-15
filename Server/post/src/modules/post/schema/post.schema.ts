import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { Document, Types } from 'mongoose';
export type PostDocument = Post & Document;

@Schema({ _id: false })
class Coordinates {
  @Prop({ type: Number })
  longitude: number;
  @Prop({ type: Number })
  latitude: number;
}

@Schema({ _id: false })
class Location {
  @Prop()
  name: string;
  @Prop({ type: Coordinates })
  coordinates: Coordinates;
}

@Schema({ _id: false })
class Statistics {
  @Prop({ default: 0 })
  likeCount: number;
  @Prop({ default: 0 })
  commentCount: number;
}

@Schema({ _id: false })
class Author {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  avatar: string;

  @Prop()
  role: string;
}

export enum PrivacySetting {
  JUST_ME = 'just me',
  PUBLIC = 'public',
  FRIEND = 'friend',
}


@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Author, required: true })
  author: Author;

  @Prop()
  caption: string;

  @Prop([
    {
      image_url: { type: String, required: true },
      image_public_id: { type: String, required: true },
      width: { type: Number },
      height: { type: Number },
      altText: { type: String },
    },
  ])
  images: {
    image_url: string;
    image_public_id: string;
    width?: number;
    height?: number;
    altText?: string;
  }[];

  @Prop([String])
  tags: string[];

  @Prop({ type: Location })
  location: Location;

  @Prop()
  @IsEnum(PrivacySetting)
  privacy: PrivacySetting;

  @Prop({
    type: Statistics,
    default: () => ({ likeCount: 0, commentCount: 0 }),
  })
  statistics: Statistics;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  mentionedUsers: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ userId: 1 });

PostSchema.index({ tags: 1 });

PostSchema.index({ privacy: 1 });

PostSchema.index({ createdAt: -1 });