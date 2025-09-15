export interface UserDocument {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  avatar?: {
    avatar_url?: string;
    avatar_public_id?: string;
  };
  isPrivate: boolean;
  isVerified: boolean;
  phoneNumber?: string;
  gender?: string;
  website?: string;
  location?: {
    country?: string;
    city?: string;
  };
  statistics: {
    postCount: number;
    followerCount: number;
    followingCount: number;
  };
  lastActive?: Date;
  accountStatus: string;
  createdAt: Date;
  updatedAt?: Date;
}
