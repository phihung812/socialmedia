<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import api from '@/service/api'
import { AxiosError } from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const registerForm = ref({
  email: '',
  fullName: '',
  username: '',
  password: ''
})

const errors = ref({
  email: '',
  fullName: '',
  username: '',
  password: ''
})

const currentYear = new Date().getFullYear()

// Validation functions
const validateEmail = (email: string) => {
  if (!email) return 'Email là bắt buộc'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? '' : 'Email không đúng định dạng'
}

const validateFullName = (fullName: string) => {
  if (!fullName) return 'Họ tên là bắt buộc'
  if (fullName.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự'
  return ''
}

const validateUsername = (username: string) => {
  if (!username) return 'Tên người dùng là bắt buộc'
  if (username.length < 5) return 'Tên người dùng phải có ít nhất 5 ký tự'
  if (username.length > 15) return 'Tên người dùng không được quá 15 ký tự'
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  return usernameRegex.test(username) ? '' : 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'
}

const validatePassword = (password: string) => {
  if (!password) return 'Mật khẩu là bắt buộc'
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự'
  return ''
}

// Watch for changes and validate
watch(() => registerForm.value.email, (newVal) => {
  errors.value.email = validateEmail(newVal)
})

watch(() => registerForm.value.fullName, (newVal) => {
  errors.value.fullName = validateFullName(newVal)
})

watch(() => registerForm.value.username, (newVal) => {
  errors.value.username = validateUsername(newVal)
})

watch(() => registerForm.value.password, (newVal) => {
  errors.value.password = validatePassword(newVal)
})

const isFormValid = computed(() => {
  return !errors.value.email &&
         !errors.value.fullName &&
         !errors.value.username &&
         !errors.value.password &&
         registerForm.value.email.trim() !== '' &&
         registerForm.value.fullName.trim() !== '' &&
         registerForm.value.username.trim() !== '' &&
         registerForm.value.password.trim() !== ''
})

const handleRegister = async () => {
  // Validate all fields before submitting
  errors.value.email = validateEmail(registerForm.value.email)
  errors.value.fullName = validateFullName(registerForm.value.fullName)
  errors.value.username = validateUsername(registerForm.value.username)
  errors.value.password = validatePassword(registerForm.value.password)
  
  if (!isFormValid.value) {
    alert('Vui lòng kiểm tra lại thông tin và sửa các lỗi')
    return
  }
  
  const data = { ...registerForm.value }
  try {
    const response = await api.post('/users', data)
    alert('Tạo tài khoản thành công')
    router.push('/login') 
  } catch (error) {
    const err = error as AxiosError<any>
    alert(err.response?.data.message || 'Có lỗi xảy ra khi tạo tài khoản')
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-wrapper">
      <div class="auth-card register-card">
        <div class="logo">
          <h1>Mevu</h1>
        </div>
        
        <h2 class="signup-message">Sign up to see photos and videos from your friends.</h2>
        
        <button class="facebook-signup-btn">
          <i class="fab fa-facebook-square"></i>
          <span>Log in with Facebook</span>
        </button>
        
        <div class="divider">
          <span class="line"></span>
          <span class="divider-text">OR</span>
          <span class="line"></span>
        </div>
        
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <input 
              type="email" 
              placeholder="Mobile Number or Email" 
              v-model="registerForm.email"
              :class="{ 'error': errors.email }"
              required
            />
            <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
          </div>
          
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Full Name" 
              v-model="registerForm.fullName"
              :class="{ 'error': errors.fullName }"
              required
            />
            <p v-if="errors.fullName" class="error-message">{{ errors.fullName }}</p>
          </div>
          
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Username" 
              v-model="registerForm.username"
              :class="{ 'error': errors.username }"
              required
            />
            <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
          </div>
          
          <div class="form-group">
            <input 
              type="password" 
              placeholder="Password" 
              v-model="registerForm.password"
              :class="{ 'error': errors.password }"
              required
            />
            <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
          </div>
          
          <div class="policy-info">
            <p>
              People who use our service may have uploaded your contact information to Instagram. 
              <a href="#">Learn More</a>
            </p>
            
            <p>
              By signing up, you agree to our 
              <a href="#">Terms</a>, 
              <a href="#">Privacy Policy</a> and 
              <a href="#">Cookies Policy</a>.
            </p>
          </div>
          
          <button type="submit" class="signup-btn" :disabled="!isFormValid" :class="{ 'btn-active': isFormValid }">
            Sign up
          </button>
        </form>
      </div>
      
      <div class="auth-card-alt">
        <p>Have an account? <router-link to="/login" class="login-link">Log in</router-link></p>
      </div>
      
      
    </div>
    
    <footer class="auth-footer">
      <div class="footer-links">
        <a href="#">About</a>
        <a href="#">Blog</a>
        <a href="#">Jobs</a>
        <a href="#">Help</a>
        <a href="#">API</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Top Accounts</a>
        <a href="#">Hashtags</a>
        <a href="#">Locations</a>
        <a href="#">Instagram Lite</a>
        <a href="#">Contact Uploading & Non-Users</a>
      </div>
      <div class="copyright">
        <select aria-label="Switch Display Language">
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
        </select>
        <span>© {{ currentYear }} Instagram from Meta</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.auth-container {
  min-height: 100vh;
  background-color: #fafafa;
  color: #262626;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
}

.auth-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 30px 0;
  max-width: 390px;
  margin: 0 auto;
}

.auth-card {
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  padding: 20px 40px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.register-card {
  padding-bottom: 25px;
}

.logo {
  margin: 22px auto 12px;
}

.logo h1 {
  font-family: 'Roboto', cursive;
  font-size: 36px;
  font-weight: 500;
}

.signup-message {
  color: #8e8e8e;
  font-size: 17px;
  font-weight: 600;
  line-height: 20px;
  margin: 0 40px 20px;
  text-align: center;
}

.facebook-signup-btn {
  background-color: #0095f6;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 7px 16px;
  width: 100%;
  margin-bottom: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.facebook-signup-btn i {
  font-size: 18px;
  margin-right: 8px;
}

.divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 0 18px;
}

.line {
  flex: 1;
  height: 1px;
  background-color: #dbdbdb;
}

.divider-text {
  color: #8e8e8e;
  font-size: 13px;
  font-weight: 600;
  margin: 0 18px;
  text-transform: uppercase;
}

form {
  width: 100%;
}

.form-group {
  margin-bottom: 6px;
  width: 100%;
}

input {
  background-color: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  color: #262626;
  font-size: 14px;
  padding: 9px 8px;
  width: 100%;
  height: 36px;
}

input:focus {
  border-color: #a8a8a8;
  outline: none;
}

input.error {
  border-color: #ed4956;
}

.error-message {
  color: #ed4956;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 8px;
  text-align: left;
}

.policy-info {
  color: #8e8e8e;
  font-size: 12px;
  line-height: 16px;
  margin: 10px 0;
  text-align: center;
}

.policy-info p {
  margin-bottom: 10px;
}

.policy-info a {
  color: #8e8e8e;
  font-weight: 600;
  text-decoration: none;
}

.signup-btn {
  background-color: #0095f6;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 7px 16px;
  width: 100%;
  margin-top: 10px;
  opacity: 0.7;
  cursor: pointer;
  height: 32px;
}

.signup-btn.btn-active {
  opacity: 1;
}

.signup-btn:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.auth-card-alt {
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  padding: 20px;
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;
  width: 100%;
}

.login-link {
  color: #0095f6;
  font-weight: 600;
  text-decoration: none;
}

.get-app {
  text-align: center;
  margin: 20px 0;
  width: 100%;
}

.get-app p {
  margin-bottom: 20px;
  font-size: 14px;
}

.app-download {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.app-btn {
  display: inline-block;
}

.app-btn img {
  height: 40px;
}

.auth-footer {
  padding-bottom: 52px;
  text-align: center;
  width: 100%;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 0 16px;
}

.footer-links a {
  color: #8e8e8e;
  font-size: 12px;
  text-decoration: none;
}

.copyright {
  color: #8e8e8e;
  font-size: 12px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.copyright select {
  border: none;
  background: transparent;
  color: #8e8e8e;
  font-size: 12px;
  cursor: pointer;
}

/* Media queries */
@media (max-width: 735px) {
  .auth-wrapper {
    padding: 0;
  }
  
  .auth-card, .auth-card-alt {
    border: none;
    background: transparent;
  }
}

@media (max-width: 450px) {
  .auth-card {
    padding: 20px;
  }
  
  .footer-links {
    gap: 8px;
  }
}
</style>