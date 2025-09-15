<template>
  <div class="settings-panel">
    <h2>Bảo mật tài khoản</h2>
    
    <form @submit.prevent="updatePassword">
      <div class="form-group">
        <label for="current-password">Mật khẩu hiện tại</label>
        <input 
          type="password" 
          id="current-password" 
          v-model="security.currentPassword" 
          placeholder="Nhập mật khẩu hiện tại"
        />
      </div>
      
      <div class="form-group">
        <label for="new-password">Mật khẩu mới</label>
        <input 
          type="password" 
          id="new-password" 
          v-model="security.newPassword" 
          placeholder="Nhập mật khẩu mới"
        />
      </div>
      
      <div class="form-group">
        <label for="confirm-password">Xác nhận mật khẩu mới</label>
        <input 
          type="password" 
          id="confirm-password" 
          v-model="security.confirmPassword" 
          placeholder="Nhập lại mật khẩu mới"
        />
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="!isPasswordFormValid">Cập nhật mật khẩu</button>
      </div>
    </form>
    
    <div class="security-section">
      <h3>Xác thực hai yếu tố</h3>
      <div class="toggle-container">
        <p>Bảo vệ tài khoản của bạn bằng lớp bảo mật bổ sung</p>
        <label class="switch">
          <input type="checkbox" v-model="security.twoFactor">
          <span class="slider"></span>
        </label>
      </div>
      <div v-if="security.twoFactor" class="two-factor-setup">
        <p>Chọn phương thức xác thực:</p>
        <div class="radio-options">
          <label>
            <input type="radio" v-model="security.twoFactorMethod" value="app">
            Ứng dụng xác thực
          </label>
          <label>
            <input type="radio" v-model="security.twoFactorMethod" value="sms">
            Tin nhắn SMS
          </label>
        </div>
      </div>
    </div>
    
    <div class="security-section">
      <h3>Hoạt động đăng nhập</h3>
      <p>Kiểm tra những thiết bị đã đăng nhập vào tài khoản của bạn</p>
      <button class="btn-secondary">Xem hoạt động</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const security = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: false,
  twoFactorMethod: 'app',
});


const isPasswordFormValid = computed(() => {
  return security.value.currentPassword && 
         security.value.newPassword && 
         security.value.confirmPassword && 
         security.value.newPassword === security.value.confirmPassword;
});


const updatePassword = () => {
  if (isPasswordFormValid.value) {
    // Gửi yêu cầu đổi mật khẩu lên API
    console.log('Đang cập nhật mật khẩu:', security.value);
    alert('Mật khẩu đã được cập nhật thành công!');
    // Reset form
    security.value.currentPassword = '';
    security.value.newPassword = '';
    security.value.confirmPassword = '';
  }
};
</script>

<style scoped>
.settings-panel h2 {
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 22px;
  font-weight: 600;
  color: #262626;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
  color: #262626;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: var(--accent-color, #0095f6);
  outline: none;
}

.form-actions {
  margin-top: 30px;
}

.btn-primary {
  background-color: var(--accent-color, #0095f6);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: rgba(0, 149, 246, 0.8);
}

.btn-primary:disabled {
  background-color: rgba(0, 149, 246, 0.3);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: transparent;
  color: var(--accent-color, #0095f6);
  border: 1px solid var(--accent-color, #0095f6);
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(0, 149, 246, 0.1);
}

.security-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dbdbdb;
}

.security-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-container p {
  margin: 0;
  flex: 1;
}

/* Switch toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent-color, #0095f6);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--accent-color, #0095f6);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.two-factor-setup {
  margin-top: 15px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.radio-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.radio-options label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-options input {
  margin-right: 10px;
  width: auto;
}

/* Dark mode styles */
[data-theme="dark"] .settings-panel h2,
[data-theme="dark"] .security-section h3 {
  color: var(--text-primary);
}

[data-theme="dark"] .form-group label {
  color: var(--text-primary);
}

[data-theme="dark"] .form-group input {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .security-section {
  border-bottom: 1px solid var(--border-color);
}

[data-theme="dark"] .two-factor-setup {
  background-color: var(--bg-secondary);
}

[data-theme="dark"] .slider {
  background-color: #444;
}

[data-theme="dark"] .btn-secondary {
  color: var(--accent-color, #0095f6);
  border-color: var(--accent-color, #0095f6);
}
</style>