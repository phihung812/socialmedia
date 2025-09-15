import api from '@/service/api';

export const createMessage = async (sendMessage) => {    
  try {
    const access_token = localStorage.getItem('access_token');
    const res = await api.post(`/message`, sendMessage,{
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi khi gửi tin nhắn:', err);
    throw err;
  }
};

export const getConversation = async () => {
  try {
    const access_token = localStorage.getItem('access_token');
    const res = await api.get(`/conversation`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi khi lấy tin nhắn:', err);
    throw err;
  }
};

export const readMessage = async (receiverId: string) => {
  try {
    const access_token = localStorage.getItem('access_token');
    const res = await api.post(
      `/message/read`,
      { receiverId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Lỗi khi lấy tin nhắn:', err);
    throw err;
  }
};

export const detailMessage = async (receiverId: string) => {
  try {
    const access_token = localStorage.getItem('access_token');
    const res = await api.get(`/message/${receiverId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi khi lấy tin nhắn:', err);
    throw err;
  }
};

export const deleteConversation = async (conversationId: string) => {
  try {
    const access_token = localStorage.getItem('access_token');
    const res = await api.patch(`/conversation/${conversationId}/delete`, {},{
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi khi xóa cuộc trò chuyện:', err);
    throw err;
  }
};
