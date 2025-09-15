import api from '@/service/api';

export const follow = async (followingId: string) => {
    
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.post(
      `/graph/follow`,
      { followingId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Có lỗi khi theo dõi người dùng:', err);
    throw err;
  }
};

export const unfollow = async (followerId: string) => {

  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.post(
      `/graph/unfollow`,
      { followerId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Có lỗi khi hủy theo dõi người dùng:', err);
    throw err;
  }
};
