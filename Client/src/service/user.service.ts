import api from '@/service/api';

export const getUserProfile = async (username: string) => {  
  
  const access_token = localStorage.getItem('access_token');
  try {
    const res = await api.get(`/users/${username}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    
    return res.data;
  } catch (err) {
    console.error('[UserService] getUserProfile error:', err);
    throw err;
  }
};

export const getUserToProfileMe = async()=>{
  try {
    const token = localStorage.getItem('access_token');

    const response = await api.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

     return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
  } 
}

