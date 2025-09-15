import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowDocument = Follow & Document;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  followerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  followingId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending',
  })
  status: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

FollowSchema.index({ followerId: 1 });

FollowSchema.index({ followingId: 1 });

FollowSchema.index({ status: 1 });

FollowSchema.index({ followerId: 1, status: 1 });

FollowSchema.index({ followingId: 1, status: 1 });
