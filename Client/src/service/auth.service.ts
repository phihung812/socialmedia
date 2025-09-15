import api from "@/service/api";
import { AxiosError } from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
export const login = async(data)=>{
    try {
      const response = await api.post('/auth/login', data);
      const res = response.data;
      alert('Đăng nhập thành công')
      return res
    
    } catch (error) {
      const err = error as AxiosError<any>;
      alert(err.response?.data.message);
    }
}

export const logout = async ()=>{
  try {
    const response = await api.post('/auth/logout', {});
  } catch (error) {
    console.log('Đăng xuất thất bại');
    
  }
}