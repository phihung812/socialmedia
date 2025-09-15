import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;


  @Schema({ _id: false })
  class ParticipantDetail {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    fullName: string;

    @Prop()
    avatar?: string;
  }

  @Schema({ timestamps: true })
  export class Conversation {
    @Prop({ required: true })
    isGroup: boolean;

    @Prop()
    name?: string;

    @Prop()
    avatarUrl?: string;

    @Prop({ type: Types.ObjectId })
    creatorId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId }], required: true })
    participants: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId }], default: [] })
    admins: Types.ObjectId[];

    @Prop({
      type: [ParticipantDetail],
      default: [],
    })
    participantDetails: ParticipantDetail[];

    @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
    lastMessageId: Types.ObjectId;

    @Prop({ type: Map, of: Date, default: {} })
    deletedAtFor: Map<string, Date>;
  }

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1 }); 
ConversationSchema.index({ 'lastMessage.createdAt': -1 }); 
ConversationSchema.index({ creatorId: 1 });
ConversationSchema.index({ isGroup: 1 });