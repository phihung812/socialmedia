import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedDocument = Feed & Document;

@Schema()
export class FeedItem {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['following', 'suggested', 'promoted'],
    required: true,
  })
  sourceType: string;

  @Prop({ type: Number, default: 0 })
  score: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: { createdAt: false, updatedAt: 'lastUpdated' } })
export class Feed {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [FeedItem], default: [] })
  items: FeedItem[];

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);

// Indexes
FeedSchema.index({ userId: 1 });
FeedSchema.index({ 'items.postId': 1 });
FeedSchema.index({ 'items.score': -1 });
FeedSchema.index({ 'items.createdAt': -1 });
