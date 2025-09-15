import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: String, required: true, unique: true })
  jti: string; // JWT ID
  
  @Prop({ type: Boolean, default: true })
  revoked: boolean;

  @Prop({ type: String })
  expires_at: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
// RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ expires_at: 1 });
