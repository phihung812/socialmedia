import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LikeDocument = Like & Document;


@Schema({ versionKey: false })
export class Like extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}


export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
