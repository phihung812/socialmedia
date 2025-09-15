<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/service/auth.service';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore()
const router = useRouter()
const loginForm = ref({
  email: '',
  password: ''
});

const activeImage = ref(1);
const imageInterval = ref<ReturnType<typeof setInterval> | null>(null);
const currentYear = new Date().getFullYear();

const isFormValid = computed(() => {
  return loginForm.value.email.trim() !== '' && loginForm.value.password.trim() !== '';
});


const handleLogin = async() => { 
  const data = {
    email: loginForm.value.email,
    password: loginForm.value.password
  } 
  
  try {
    const res = await login(data)
    const user = res.user;
    const token =  res.access_token;
    authStore.successLogin({ userData: user, token })

    router.push('/');
  } catch (error) {
    console.log(error);
  }
  
};

const rotateImages = () => {
  activeImage.value = activeImage.value === 3 ? 1 : activeImage.value + 1;
};

onMounted(() => {
  imageInterval.value = setInterval(rotateImages, 4000);
});

onBeforeUnmount(() => {
  if (imageInterval.value) {
    clearInterval(imageInterval.value);
  }
});
</script>

<template>
  <div class="auth-container">
    <div class="auth-wrapper">
      
      <div class="auth-right">
        <div class="auth-card">
          <div class="logo">
            <h1>Mevu</h1>
          </div>
          
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <input 
                type="text" 
                placeholder="Phone number, username, or email" 
                v-model="loginForm.email"
                required
              />
            </div>
            
            <div class="form-group">
              <input 
                type="password" 
                placeholder="Password" 
                v-model="loginForm.password"
                required
              />
            </div>
            
            <button 
              type="submit" 
              class="login-btn"
              :disabled="!isFormValid"
              :class="{ 'btn-active': isFormValid }"
            >
              Log In
            </button>
          </form>
          
          <div class="divider">
            <span class="line"></span>
            <span class="divider-text">OR</span>
            <span class="line"></span>
          </div>
          
          <div class="social-login">
            <button class="facebook-btn">
              <i class="fab fa-facebook-square"></i>
              <span>Log in with Facebook</span>
            </button>
          </div>
          
          <div class="forgot-password">
            <a href="#">Forgot password?</a>
          </div>
        </div>
        
        <div class="auth-card-alt">
          <p>Don't have an account? <router-link to="/register" class="signup-link">Sign up</router-link></p>
        </div>
        
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
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 30px 0;
  max-width: 935px;
  margin: 0 auto;
}

.auth-left {
  display: none;
}

.auth-right {
  width: 1000px;
  max-width: 450px;

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

.logo {
  margin: 22px auto 12px;
}

.logo h1 {
  font-family: 'Roboto', cursive;
  font-size: 36px;
  font-weight: 500;
}

form {
  width: 100%;
  margin-top: 24px;
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

.login-btn {
  background-color: #0095f6;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 7px 16px;
  width: 100%;
  margin-top: 14px;
  opacity: 0.7;
  cursor: pointer;
  height: 32px;
}

.login-btn.btn-active {
  opacity: 1;
}

.login-btn:disabled {
  cursor: default;
}

.divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 18px 0;
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

.social-login {
  width: 100%;
  margin-bottom: 18px;
}

.facebook-btn {
  background: none;
  border: none;
  color: #385185;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.facebook-btn i {
  font-size: 18px;
  margin-right: 8px;
}

.forgot-password {
  margin-top: 12px;
  font-size: 12px;
}

.forgot-password a {
  color: #00376b;
  text-decoration: none;
}

.auth-card-alt {
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  padding: 20px;
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;
}

.signup-link {
  color: #0095f6;
  font-weight: 600;
  text-decoration: none;
}

.get-app {
  text-align: center;
  margin: 20px 0;
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
@media (min-width: 736px) {
  .auth-left {
    display: block;
  }
}

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