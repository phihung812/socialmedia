import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedPostDocument = SavedPost & Document;

@Schema({ _id: false })
class Statistics {
  @Prop({ default: 0 })
  likeCount: number;
  @Prop({ default: 0 })
  commentCount: number;
}

@Schema({ _id: false })
class Image {
  @Prop()
  image_url: string;

  @Prop()
  image_public_id: string;

  @Prop()
  altText?: string;
}

@Schema({ _id: false })
class Author {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  username: string;
}

@Schema({
  timestamps: true,
  collection: 'savedPosts',
})
export class SavedPost {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Author, required: true })
  author: Author;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  postId: Types.ObjectId;

  @Prop({
    type: String,
    default: 'Default',
    maxlength: 50,
    trim: true,
  })
  collectionName: string;

  @Prop({ type: [Image], default: [] })
  images: Image[];

  @Prop({
    type: Statistics,
    default: () => ({ likeCount: 0, commentCount: 0 }),
  })
  statistics: Statistics;

  @Prop({ type: Date, default: Date.now, index: true })
  createdAt: Date;
}

export const SavedPostSchema = SchemaFactory.createForClass(SavedPost);

SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true }); 
SavedPostSchema.index({ userId: 1, createdAt: -1 }); 
SavedPostSchema.index({ userId: 1, collectionName: 1, createdAt: -1 }); 
SavedPostSchema.index({ postId: 1 });
