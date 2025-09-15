export declare class UpdateLocationDto {
  country?: string;
  city?: string;
}
export declare class UpdateUserDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  isPrivate?: boolean;
  phoneNumber?: string;
  gender?: string;
  website?: string;
  location?: UpdateLocationDto;
}
