import { defineStore } from 'pinia';
import { Notification } from '@/service/notification.service';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notificationMap: {} as Record<
      string,
      {
        notifications: Notification[];
        totalPages: number;
        page: number;
        loading: boolean;
      }
    >,
  }),

  actions: {
    setNotifications(
      userId: string,
      notifications: Notification[],
      page: number,
      totalPages: number
    ) {      
      this.notificationMap[userId] = {
        notifications,
        totalPages,
        page,
        loading: false,
      };
    },

    addNotification(userId: string, notification: Notification) {
      
      if (!this.notificationMap[userId]) {
        this.notificationMap[userId] = {
          notifications: [],
          totalPages: 1,
          page: 1,
          loading: false,
        };
      }
      this.notificationMap[userId].notifications.unshift(notification);
    },

    markAsRead(userId: string, notificationId: string) {      
      const userNoti = this.notificationMap[userId];
      if (!userNoti) return;
      const noti = userNoti.notifications.find((n) => n._id === notificationId);
      if (noti) noti.isRead = true;      
    },

    setLoading(userId: string, value: boolean) {
      if (this.notificationMap[userId]) {
        this.notificationMap[userId].loading = value;
      }
    },

    // thêm thông báo vào cuối danh sách khi load xuống cuối trang thông báo
    appendNotifications(
      userId: string,
      newNotis: Notification[],
      totalPages: number
    ) {
      const userData = this.notificationMap[userId];
      if (!userData) return;

      userData.notifications.push(...newNotis);
      userData.page += 1;
      userData.totalPages = totalPages;
    },

    resetNotifications(userId: string) {
      this.notificationMap[userId] = {
        notifications: [],
        totalPages: 1,
        page: 1,
        loading: false,
      };
    },

    deleteNotification(userId: string, notificationId: string) {
      console.log(userId, notificationId);
      
      const notifications = this.notificationMap[userId]?.notifications;
      if (!notifications) return; 
    
      const index = notifications.findIndex(n => n._id === notificationId);
      if (index !== -1) {
        notifications.splice(index, 1); 
      }
    }
    
  },
  getters: {
    getNotifications: (state) => {
      return (userId: string) => {        
        return state.notificationMap[userId]?.notifications || [];
      };
    },
  },

  persist: true,
});
