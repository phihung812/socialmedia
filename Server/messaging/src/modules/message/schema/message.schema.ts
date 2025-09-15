import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ _id: false })
class Sender {
  @Prop({ required: true })
  senderUsername: string;

  @Prop({ required: true })
  senderFullName: string;

  @Prop()
  senderAvatar: string;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Sender, required: true })
  sender: Sender;

  @Prop({ type: String, required: false })
  content?: string;

  @Prop({
    type: String,
    enum: ['text', 'image', 'video', 'audio'],
    default: 'text',
  })
  contentType: string;

  @Prop()
  mediaUrl?: string;

  @Prop({ type: [{ type: Types.ObjectId }], default: [] })
  readBy: Types.ObjectId[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ readBy: 1 });  
MessageSchema.index({ conversationId: 1, createdAt: -1 });