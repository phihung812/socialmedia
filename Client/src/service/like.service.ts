import api from '@/service/api';

export const likePost = async (postId: string) => {
    
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.post(
      `/interaction/like`,
      { postId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Có lỗi like bài viết:', err);
    throw err;
  }
};

export const unlikePost = async (postId: string) => {
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.post(
      `/interaction/like/unlike`,
      { postId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Có lỗi like bài viết:', err);
    throw err;
  }
};
