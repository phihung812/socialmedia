<template>
  <div class="settings-panel">
    <h2>Thông báo</h2>
    
    <div class="notification-section">
      <h3>Thích</h3>
      <div class="notification-options">
        <label>
          <input type="radio" v-model="notifications.likes" value="fromEveryone">
          <span>Từ tất cả mọi người</span>
        </label>
        <label>
          <input type="radio" v-model="notifications.likes" value="fromPeopleIFollow">
          <span>Từ người tôi theo dõi</span>
        </label>
        <label>
          <input type="radio" v-model="notifications.likes" value="off">
          <span>Tắt</span>
        </label>
      </div>
    </div>
    
    <div class="notification-section">
      <h3>Bình luận</h3>
      <div class="notification-options">
        <label>
          <input type="radio" v-model="notifications.comments" value="fromEveryone">
          <span>Từ tất cả mọi người</span>
        </label>
        <label>
          <input type="radio" v-model="notifications.comments" value="fromPeopleIFollow">
          <span>Từ người tôi theo dõi</span>
        </label>
        <label>
          <input type="radio" v-model="notifications.comments" value="off">
          <span>Tắt</span>
        </label>
      </div>
    </div>
    
    <div class="notification-section">
      <h3>Theo dõi mới</h3>
      <div class="notification-options">
        <label>
          <input type="radio" v-model="notifications.newFollows" value="on">
          <span>Bật</span>
        </label>
        <label>
          <input type="radio" v-model="notifications.newFollows" value="off">
          <span>Tắt</span>
        </label>
      </div>
    </div>
    
    <div class="notification-section">
      <h3>Tin nhắn</h3>
      <div class="notification-options">
        <label>
          <input type="radio" v-model="notifications.messages" value="fromEveryone">
          <span>Từ tất cả mọi người</span>
        </label>
        <label>
          <input type="radio" v-model="notifications.messages" value="fromPeopleIFollow">
          <span>Từ người tôi theo dõi</span>
        </label>
        <label>
          <input type="radio" v-model="notifications.messages" value="off">
          <span>Tắt</span>
        </label>
      </div>
    </div>
    
    <div class="form-actions">
      <button @click="$emit('save-notifications')" class="btn-primary">Lưu cài đặt</button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue';

const notifications = ref({
  likes: {
    fromEveryone: true,
    fromPeopleIFollow: false,
    off: false,
  },
  comments: {
    fromEveryone: true,
    fromPeopleIFollow: false,
    off: false,
  },
  newFollows: {
    on: true,
    off: false,
  },
  messages: {
    fromEveryone: false,
    fromPeopleIFollow: true,
    off: false,
  },
});

defineEmits(['save-notifications']);
</script>

<style scoped>
.settings-panel h2 {
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 22px;
  font-weight: 600;
  color: #262626;
}

.notification-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dbdbdb;
}

.notification-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-options label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.notification-options input {
  margin-right: 10px;
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

/* Dark mode styles */
[data-theme="dark"] .settings-panel h2,
[data-theme="dark"] .notification-section h3 {
  color: var(--text-primary);
}

[data-theme="dark"] .notification-section {
  border-bottom: 1px solid var(--border-color);
}

[data-theme="dark"] .notification-options label {
  color: var(--text-primary);
}
</style>