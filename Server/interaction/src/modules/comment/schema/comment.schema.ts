import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Number, default: 0 })
  replyCount: number;

  @Prop({ type: [Types.ObjectId], default: [] })
  mentionedUsers: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, default: null, index: true })
  parentId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  likeCount: number;

}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({ postId: 1, createdAt: -1 }); 
CommentSchema.index({ postId: 1, parentId: 1 });  
CommentSchema.index({ userId: 1, createdAt: -1 });  
CommentSchema.index({ parentId: 1, createdAt: 1 }); 
CommentSchema.index({ postId: 1, parentId: 1, createdAt: -1 }); 
CommentSchema.index({ mentionedUsers: 1, createdAt: -1 }); 
CommentSchema.index({ likeCount: -1 }); 

CommentSchema.index({ content: 'text' });

CommentSchema.index({ parentId: 1 }, { sparse: true });
