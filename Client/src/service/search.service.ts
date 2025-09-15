import api from '@/service/api';

export const searchGlobal = async (params: { query: string }) => {
  try {
    const access_token = localStorage.getItem('access_token');
    const res = await api.get('/api/search', {
      params,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Có lỗi khi tím kiếm:', err);
    throw err;
  }
};
