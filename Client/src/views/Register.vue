<template>
  <div class="auth-container">
    <div class="auth-wrapper">
      <div class="auth-card register-card">
        <div class="logo">
          <h1>Instagram</h1>
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
              required
            />
          </div>
          
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Full Name" 
              v-model="registerForm.fullName"
              required
            />
          </div>
          
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Username" 
              v-model="registerForm.username"
              required
            />
          </div>
          
          <div class="form-group">
            <input 
              type="password" 
              placeholder="Password" 
              v-model="registerForm.password"
              required
            />
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
          
          <button 
            type="submit" 
            class="signup-btn"
            :disabled="!isFormValid"
            :class="{ 'btn-active': isFormValid }"
          >
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

<script>
export default {
  name: 'Register',
  data() {
    return {
      registerForm: {
        email: '',
        fullName: '',
        username: '',
        password: ''
      },
      currentYear: new Date().getFullYear()
    }
  },
  computed: {
    isFormValid() {
      return this.registerForm.email.trim() !== '' && 
             this.registerForm.fullName.trim() !== '' &&
             this.registerForm.username.trim() !== '' &&
             this.registerForm.password.trim() !== '';
    }
  },
  methods: {
    handleRegister() {
      // Handle register logic here
      console.log('Register attempt with:', this.registerForm);
      // In a real app, you would call an API here
      alert('Register functionality would be implemented here');
    }
  }
}
</script>

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
  cursor: default;
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