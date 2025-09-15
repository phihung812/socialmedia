import api from "@/service/api";

export const detailPost = async (postId: string) => {
  try {
    const access_token = localStorage.getItem('access_token');
    const res = await api.get(`/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('[PostService] searchPosts error:', err);
    throw err;
  }
};

export const getPostsByUserProfileUser = async (userId : string)=>{
  try {
    const access_token = localStorage.getItem('access_token');
    const res = await api.get(`/posts/posts-user-profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết:', error);
    throw error;
  }

}

export const createPost = async(data: any) => {
  const token = localStorage.getItem('access_token');
  if (!token) return;
  try {
    const response = await api.post('/posts', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm bài viết:', error);
  }
}

export const getListPostByUserId = async()=> {
  const token = localStorage.getItem('access_token');
  if (!token) return;
  try {
    const response = await api.get('/posts/list-post', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data
    
  } catch (error) {
    console.error('Lỗi khi lấy thông tin:', error);
  }
}

export const deletePost = async(postId: string)=> {
  const token = localStorage.getItem('access_token');
  if (!token) return;
  try {
    const response = await api.delete(`/posts/${postId}`, {
      headers:{
        Authorization: `Bearer ${token}`,
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
  }
}

export const savedPost = async (post) => {
  const data = {
    postId: post._id,
    statistics: post.statistics,
    images: post.images,
  };

  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.post(`/interaction/saved-post`, data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Có lỗi lưu bài viết:', err);
    throw err;
  }
};

export const unSavedPost = async (post) => {
  const postId = post._id

  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.delete(`/interaction/saved-post/${postId}`,{
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Có lỗi khi bỏ lưu bài viết:', err);
    throw err;
  }
};

export const getSavedPostByUserId = async ({
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) => {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    const response = await api.get('/interaction/saved-post', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin:', error);
  }
};

