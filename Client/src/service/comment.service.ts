import api from '@/service/api';

export const getCommentToPost = async (
  postId: string,
  page = 1,
  limit = 10,
  sortBy = 'newest'
) => {
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.get(
      `interaction/comment/${postId}?page=${page}&limit=${limit}&sortBy=${sortBy}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Có lỗi lấy cmt bài viết:', err);
    throw err;
  }
};

export const getRepliesCommentByParent = async (
  postId: string,
) => {
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.get(`interaction/comment/replies/${postId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Có lỗi lấy cmt bài viết:', err);
    throw err;
  }
};

export const createComment = async (data) => {
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.post(`interaction/comment`, data ,{
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Có lỗi them cmt:', err);
    throw err;
  }
};

export const deleteCommentById = async (commentId) => {
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.delete(`interaction/comment/${commentId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Có lỗi xóa cmt:', err);
    throw err;
  }
};
