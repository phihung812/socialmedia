import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class Location {
    country: string;
    city: string;
}
export declare class Statistics {
    postCount: number;
    followerCount: number;
    followingCount: number;
}
export declare class User extends Document {
    username: string;
    email: string;
    password: string;
    fullName: string;
    bio: string;
    avatar: string;
    isPrivate: boolean;
    isVerified: boolean;
    phoneNumber: string;
    gender: string;
    website: string;
    location: Location;
    statistics: Statistics;
    lastActive: Date;
    accountStatus: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any> & User & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
