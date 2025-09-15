
export interface UserInfo {
  _id: string;
  username?: string;
  fullName?: string;
  avatar?:{
    avatar_url: string,
    avatar_public_id: string,
  };
}
