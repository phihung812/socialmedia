<template>
    <div v-if="!isLoading" class="settings-sidebar">
        <div class="profile-preview">
          <div class="avatar-container">
            <img :src="currentUser.avatar.avatar_url || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'" alt="Profile Avatar" class="avatar" />
            <div class="avatar-overlay" @click="triggerFileInput">
              <span>Thay đổi</span>
            </div>
            <input type="file" ref="fileInput" accept="image/*" class="hidden-input" @change="handleAvatarChange"/>
          </div>
          <div class="profile-info">
            <h3>{{ currentUser.username }}</h3>
            <p class="change-photo-text" @click="triggerFileInput">Thay đổi ảnh đại diện</p>
          </div>
        </div>
        
        <ul class="settings-menu">
          <li :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
            <router-link to="/setting" class="menu-item">
              <User class="menu-icon" />
              <span>Chỉnh sửa thông tin</span>
            </router-link>
          </li>
          
          <li :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
            <router-link to="/setting/security" class="menu-item">
              <Lock class="menu-icon" />
              <span>Bảo mật</span>
            </router-link>
          </li>

          <li :class="{ active: activeTab === 'privacy' }" @click="activeTab = 'privacy'">
            <router-link to="/setting/privacy" class="menu-item">
              <Shield class="menu-icon" />
              <span>Quyền riêng tư</span>
            </router-link>
          </li>

          <li :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
            <router-link to="/setting/notification" class="menu-item">
              <Bell class="menu-icon" />
              <span>Thông báo</span>
            </router-link>
          </li>

          <li :class="{ active: activeTab === 'appearance' }" @click="activeTab = 'appearance'">
            <router-link to="/setting/appearance" class="menu-item">
              <PaintBucket class="menu-icon" />
              <span>Giao diện</span>
            </router-link>
          </li>
        </ul>

      </div>
</template>

<script setup>
import { ref } from 'vue';
import { User, Lock, Shield, Bell, PaintBucket } from 'lucide-vue-next';
import api from '@/service/api';
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { defineEmits } from 'vue'

const emit = defineEmits(['update-avatar'])

const userStore = useUserStore()
const { currentUser, isLoading } = storeToRefs(userStore)

const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};


const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const access_token = localStorage.getItem('access_token')
  const formData = new FormData();
  formData.append('avatar', file); 

  try {    
    const response = await api.put('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${access_token}`
      }
    })
    userStore.fetchUser()
    alert('Cập nhật ảnh đại diện thành công')
  } catch (error) {
    console.error('Lỗi khi upload ảnh:', error);
  }
};


const activeTab = ref('profile');

</script>

<style scoped>
.settings-sidebar {
  width: 260px;
  border-right: 1px solid #dbdbdb;
  padding: 20px 0;
  background-color: #fafafa;
  position: sticky;
  top: 0;
  height: 100%;
  overflow-y: auto; /* Trong trường hợp sidebar dài hơn chiều cao màn hình */
}

.profile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 20px;
  border-bottom: 1px solid #dbdbdb;
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.hidden-input {
  display: none;
}

.profile-info {
  text-align: center;
}

.profile-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.change-photo-text {
  color: var(--accent-color, #0095f6);
  font-size: 14px;
  cursor: pointer;
  margin: 5px 0;
}

.settings-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.settings-menu li {
  padding: 14px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.settings-menu li:hover {
  background-color: #efefef;
}

.settings-menu li.active {
  font-weight: 600;
  color: var(--accent-color, #0095f6);
  border-left: 2px solid var(--accent-color, #0095f6);
}

.menu-item {
  display: flex;
  align-items: center;
}

.menu-icon {
  margin-right: 10px;
  width: 18px;
  height: 18px;
}
</style>