import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsMongoId } from 'class-validator';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true })
  receiverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, required: true })
  senderName: string;

  @Prop({
    type: String,
    enum: ['like', 'comment', 'reply', 'follow', 'mention', 'tag'],
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    enum: ['post', 'comment', 'user'],
    required: true,
  })
  entityType: string;

  @Prop({ type: Types.ObjectId, required: true })
  referenceId: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, required: false })
  image: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);


NotificationSchema.index({ receiverId: 1, createdAt: -1 });
NotificationSchema.index({ receiverId: 1, isRead: 1 });
NotificationSchema.index({ senderId: 1 });
NotificationSchema.index({ referenceId: 1, entityType: 1 });

