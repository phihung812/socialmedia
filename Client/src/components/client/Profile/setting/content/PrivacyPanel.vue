<template>
  <div class="settings-panel">
    <h2>Quyền riêng tư</h2>
    
    <div class="privacy-section">
      <h3>Tài khoản riêng tư</h3>
      <div class="toggle-container">
        <p>Chỉ những người bạn chấp nhận theo dõi mới có thể xem nội dung của bạn</p>
        <label class="switch">
          <input type="checkbox" v-model="privacy.privateAccount">
          <span class="slider"></span>
        </label>
      </div>
    </div>
    
    <div class="privacy-section">
      <h3>Trạng thái hoạt động</h3>
      <div class="toggle-container">
        <p>Hiển thị khi bạn đang hoạt động trên ứng dụng</p>
        <label class="switch">
          <input type="checkbox" v-model="privacy.showActivity">
          <span class="slider"></span>
        </label>
      </div>
    </div>
    
    <div class="privacy-section">
      <h3>Chặn tài khoản</h3>
      <p>Quản lý danh sách tài khoản bạn đã chặn</p>
      <button class="btn-secondary" @click="$emit('show-blocked-accounts')">Xem danh sách</button>
    </div>
    
    <div class="privacy-section">
      <h3>Tài khoản bị hạn chế</h3>
      <p>Quản lý tài khoản bạn đã hạn chế</p>
      <button class="btn-secondary" @click="$emit('show-restricted-accounts')">Xem danh sách</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const privacy = ref({
  privateAccount: false,
  showActivity: true,
});

defineEmits(['show-blocked-accounts', 'show-restricted-accounts']);
</script>

<style scoped>
.settings-panel h2 {
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 22px;
  font-weight: 600;
  color: #262626;
}

.privacy-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dbdbdb;
}

.privacy-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

.privacy-section p {
  margin: 10px 0;
  color: #262626;
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

/* Dark mode styles */
[data-theme="dark"] .settings-panel h2,
[data-theme="dark"] .privacy-section h3,
[data-theme="dark"] .privacy-section p {
  color: var(--text-primary);
}

[data-theme="dark"] .privacy-section {
  border-bottom: 1px solid var(--border-color);
}

[data-theme="dark"] .slider {
  background-color: #444;
}

[data-theme="dark"] .btn-secondary {
  color: var(--accent-color, #0095f6);
  border-color: var(--accent-color, #0095f6);
}
</style>