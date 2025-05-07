import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class Location {
  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  city: string;
}

@Schema()
export class Statistics {
  @Prop({ type: Number, default: 0 })
  postCount: number;

  @Prop({ type: Number, default: 0 })
  followerCount: number;

  @Prop({ type: Number, default: 0 })
  followingCount: number;
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class User extends Document {
  @Prop({ type: String, unique: true, required: true })
  username: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  fullName: string;

  @Prop({ type: String })
  bio: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: Boolean, default: false })
  isPrivate: boolean;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: String })
  website: string;

  @Prop({ type: Location, default: () => ({}) })
  location: Location;

  @Prop({ type: Statistics, default: () => ({}) })
  statistics: Statistics;

  @Prop({ type: Date })
  lastActive: Date;

  @Prop({
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active',
  })
  accountStatus: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Đảm bảo username và email là unique
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
