import api from '@/service/api';

export interface Notification {
  _id: string;
  receiverId: string;
  senderId: string;
  senderName: string;
  type: 'like' | 'comment' | string;
  entityType: 'post' | string;
  referenceId: string;
  content: string;
  url: string;
  image?: string;
  isRead: boolean;
  createdAt: Date;
  __v: number;
}
  
  
export const getNotificationByReceiverId = async (userId: string) => {
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.get(`/notification/receiver/${userId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Có lỗi khi lấy thông báo:', err);
    throw err;
  }
};

export const markAsReadNotification = async (notificationId: string) => {
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.patch(`/notification/${notificationId}/read`, {} ,{
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Có lỗi khi đọc thông báo:', err);
    throw err;
  }
};

export const deleteNotificationById = async (notificationId: string) => {
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.delete(
      `/notification/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Có lỗi khi xóa thông báo:', err);
    throw err;
  }
};
