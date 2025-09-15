<template>
  <div v-if="!isLoading" class="settings-panel">
    <h2>Chỉnh sửa thông tin</h2>
    
    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label for="name">Họ tên</label>
        <input 
          type="text" 
          id="name" 
          v-model="currentUser.fullName" 
          placeholder="Họ tên của bạn"
          :class="{ 'error': errors.fullName }"
        />
        <p v-if="errors.fullName" class="error-message">{{ errors.fullName }}</p>
      </div>
      
      <div class="form-group">
        <label for="username">Tên người dùng</label>
        <input 
          type="text" 
          id="username" 
          v-model="currentUser.username" 
          placeholder="Tên người dùng"
          :class="{ 'error': errors.username }"
        />
        <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
        <p v-else class="form-help">
          Sử dụng tên mà mọi người có thể dễ dàng tìm thấy bạn.
        </p>
      </div>
      
      <div class="form-group">
        <label for="bio">Tiểu sử</label>
        <textarea 
          id="bio" 
          v-model="currentUser.bio" 
          placeholder="Giới thiệu ngắn gọn về bạn"
          rows="4"
          :class="{ 'error': errors.bio }"
        ></textarea>
        <p v-if="errors.bio" class="error-message">{{ errors.bio }}</p>
        <p v-else class="form-help" :class="{ 'warning': (currentUser.bio?.length || 0) > 130 }">
          <span>{{ 150 - (currentUser.bio?.length || 0) }}</span> ký tự còn lại
        </p>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="currentUser.email" 
          placeholder="Email của bạn"
          :class="{ 'error': errors.email }"
        />
        <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
      </div>
      
      <div class="form-group">
        <label for="phone">Số điện thoại</label>
        <input 
          type="tel" 
          id="phone" 
          v-model="currentUser.phoneNumber" 
          placeholder="Số điện thoại của bạn"
          :class="{ 'error': errors.phoneNumber }"
        />
        <p v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</p>
      </div>
      
      <div class="form-group">
        <label for="website">Website</label>
        <input 
          type="url" 
          id="website" 
          v-model="currentUser.website" 
          placeholder="https://example.com"
        />
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="!isFormValid">
          Lưu thay đổi
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import api from '@/service/api';
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'

const userStore = useUserStore()
const { currentUser, isLoading } = storeToRefs(userStore)

const errors = ref({
  fullName: '',
  username: '',
  bio: '',
  email: '',
  phoneNumber: ''
})

// Validation functions
const validateEmail = (email) => {
  if (!email) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? '' : 'Email không đúng định dạng'
}

const validatePhone = (phone) => {
  if (!phone) return ''
  const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/
  return phoneRegex.test(phone) ? '' : 'Số điện thoại không đúng định dạng (VD: 0912345678)'
}

const validateUsername = (username) => {
  if (!username) return 'Tên người dùng không được để trống'
  if (username.length < 5) return 'Tên người dùng phải có ít nhất 5 ký tự'
  if (username.length > 15) return 'Tên người dùng không được quá 15 ký tự'
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  return usernameRegex.test(username) ? '' : 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'
}

const validateBio = (bio) => {
  if (!bio) return ''
  return bio.length > 150 ? 'Tiểu sử không được quá 150 ký tự' : ''
}

const validateFullName = (fullName) => {
  if (!fullName) return 'Họ tên không được để trống'
  if (fullName.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự'
  return ''
}

// Watch for changes and validate
watch(() => currentUser.value.fullName, (newVal) => {
  errors.value.fullName = validateFullName(newVal)
})

watch(() => currentUser.value.username, (newVal) => {
  errors.value.username = validateUsername(newVal)
})

watch(() => currentUser.value.bio, (newVal) => {
  errors.value.bio = validateBio(newVal)
})

watch(() => currentUser.value.email, (newVal) => {
  errors.value.email = validateEmail(newVal)
})

watch(() => currentUser.value.phoneNumber, (newVal) => {
  errors.value.phoneNumber = validatePhone(newVal)
})

// Check if form is valid
const isFormValid = computed(() => {
  return !errors.value.fullName && 
         !errors.value.username && 
         !errors.value.bio && 
         !errors.value.email && 
         !errors.value.phoneNumber &&
         currentUser.value.fullName &&
         currentUser.value.username
})

const saveProfile = async() => {
  // Validate all fields before submitting
  errors.value.fullName = validateFullName(currentUser.value.fullName)
  errors.value.username = validateUsername(currentUser.value.username)
  errors.value.bio = validateBio(currentUser.value.bio)
  errors.value.email = validateEmail(currentUser.value.email)
  errors.value.phoneNumber = validatePhone(currentUser.value.phoneNumber)
  
  // Check if form is valid
  if (!isFormValid.value) {
    alert('Vui lòng kiểm tra lại thông tin và sửa các lỗi')
    return
  }
  
  const payload = {
    fullName: currentUser.value.fullName,
    username: currentUser.value.username,
    bio: currentUser.value.bio,
    email: currentUser.value.email,
    phoneNumber: currentUser.value.phoneNumber,
    website: currentUser.value.website,
  };
  const access_token = localStorage.getItem('access_token')
  
  try {
    const response = await api.put(`/users`, payload, {
      headers:{
        Authorization: `Bearer ${access_token}`
      }
    })
    alert('Thông tin cá nhân đã được cập nhật!');
  } catch (error) {
    console.error(error);
    alert('Có lỗi xảy ra khi cập nhật thông tin');
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--accent-color, #0095f6);
  outline: none;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ed4956;
}

.form-help {
  margin-top: 6px;
  font-size: 12px;
  color: #8e8e8e;
}

.form-help.warning {
  color: #ff9500;
}

.error-message {
  margin-top: 6px;
  font-size: 12px;
  color: #ed4956;
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

.btn-primary:hover:not(:disabled) {
  background-color: rgba(0, 149, 246, 0.8);
}

.btn-primary:disabled {
  background-color: #b2dffc;
  cursor: not-allowed;
}

/* Dark mode styles */
[data-theme="dark"] .settings-panel h2 {
  color: var(--text-primary);
}

[data-theme="dark"] .form-group label {
  color: var(--text-primary);
}

[data-theme="dark"] .form-group input,
[data-theme="dark"] .form-group textarea {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .form-help {
  color: var(--text-secondary);
}

[data-theme="dark"] .form-group input.error,
[data-theme="dark"] .form-group textarea.error {
  border-color: #ed4956;
}
</style>