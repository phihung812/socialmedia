import { Types } from 'mongoose';

export enum PrivacySetting {
  JUST_ME = 'just me',
  PUBLIC = 'public',
  FRIEND = 'friend',
}

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface Location {
  name?: string;
  coordinates?: Coordinates;
}

export interface Statistics {
  likeCount: number;
  commentCount: number;
}

export interface Author {
  userId: Types.ObjectId;
  username: string;
  fullName: string;
  avatar?: string;
  role?: string;
}

export interface Image {
  image_url: string;
  image_public_id: string;
  width?: number;
  height?: number;
  altText?: string;
}

export interface Post {
  _id: Types.ObjectId; 
  userId: Types.ObjectId;
  author: Author;
  caption?: string;
  images: Image[];
  tags?: string[];
  location?: Location;
  privacy?: PrivacySetting;
  statistics: Statistics;
  mentionedUsers?: Types.ObjectId[];
  createdAt: Date; 
  updatedAt: Date;
}


export interface Location {
  country?: string;
  city?: string;
}

export interface Statistics {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface Avatar {
  avatar_url?: string;
  avatar_public_id?: string;
}

export type AccountStatus = 'active' | 'suspended' | 'deactivated';
export type UserRole = 'user' | 'admin' | 'moderator' | 'developer';

export interface User {
  _id: string; 
  username: string;
  email: string;
  password: string;
  fullName?: string;
  bio?: string;
  avatar: Avatar;
  isPrivate: boolean;
  isVerified: boolean;
  phoneNumber?: string;
  gender?: string;
  website?: string;
  location: Location;
  statistics: Statistics;
  lastActive?: Date;
  accountStatus: AccountStatus;
  role: UserRole;
  createdAt: Date; 
}
  