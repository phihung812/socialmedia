import { defineStore } from 'pinia';
import { getUserToProfileMe } from '@/service/user.service';

interface UserLocation {
  country?: string;
  city?: string;
}

interface UserStatistics {
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
}
interface Avatar {
  avatar_url: string;
  avatar_public_id: string;
  _id: string;
}
export interface User {
  _id?: string;          
  username?: string;    
  email?: string;       
  password?: string;     
  fullName?: string;
  bio?: string;
  avatar?: Avatar;      
  isPrivate?: boolean;  
  isVerified?: boolean; 
  phoneNumber?: string;
  gender?: string;
  website?: string;
  location?: UserLocation;
  statistics?: UserStatistics;
  createdAt?: Date | string;  
  lastActive?: Date | string;
  accountStatus?: 'active' | 'suspended' | 'deactivated';  
}

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: {} as User,
    isLoading: true,
    isAuthenticated: false,
  }),
  actions: {
    async fetchUser() {
      this.isLoading = true;
      try{
        this.currentUser = await getUserToProfileMe();
        this.isAuthenticated = true;
      } catch{
        this.isAuthenticated = false;        
      } finally{
        this.isLoading = false;
      }
    },

  },
  getters: {
    userName: (state): string => state.currentUser?.username || 'Khách',
  },
});
