<script setup lang="ts">

import { logout } from '@/service/auth.service'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const authStore = useAuthStore()
const { currentUser, isLoading } = storeToRefs(userStore)
const router = useRouter();


function formatNumberWithK(number) {
  return number >= 1000 ? (number / 1000).toFixed(1) + 'k' : number;
}

interface HTMLElementRef {
  value: HTMLElement | null
}

// Reactive refs
const isOpen = ref < boolean > (false)
const settingsContainer = ref < HTMLElement | null > (null)
const settingsBtn = ref < HTMLElement | null > (null)
const settingsDropdown = ref < HTMLElement | null > (null)

// Methods
const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const closeDropdown = (): void => {
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent): void => {
  const target = event.target as HTMLElement
  if (settingsContainer.value && !settingsContainer.value.contains(target)) {
    closeDropdown()
  }
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

const handleSettings = (event: Event): void => {
  event.preventDefault()
  // TODO: Navigate to settings page
  // Example: router.push('/settings')
  alert('Chuyển đến trang cài đặt')
  closeDropdown()
}

const handleLogout = async (event: Event) => {
  event.preventDefault()
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    await logout();
    await authStore.logout()
    router.push('/login')
    alert('Đăng xuất thành công')
    closeDropdown()
  }
}

// Lifecycle hooks
onMounted((): void => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted((): void => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})


function editProfile() {
  alert('Mở form chỉnh sửa thông tin cá nhân');
}

function openSettings() {
  alert('Mở cài đặt tài khoản');
}

function addNewHighlight() {
  alert('Thêm highlight mới');
}

function addNewPost() {
  alert('Thêm bài viết mới');
}

function createNewReel() {
  alert('Tạo reel mới');
}

function editPost(postId) {
  alert(`Chỉnh sửa bài viết #${postId}`);
}

function deletePost(postId) {
  alert(`Xóa bài viết #${postId}`);
}
</script>

<template>
  <div v-if="isLoading">
    <h2>Đang load...</h2>
  </div>
  <div v-else class="instagram-profile">
    <!-- Header với thông tin người dùng -->
    <div class="profile-header">
      <div class="profile-avatar">
        <img
          :src="currentUser.avatar?.avatar_url || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'" />
      </div>
      <div class="profile-info">
        <div class="profile-username">
          <h2>{{ currentUser.username }}</h2>
          <router-link to="setting" class="edit-profile-button">Chỉnh sửa trang cá nhân</router-link>
          <!-- <button class="settings-button">
            <i class="settings-icon"></i>
          </button> -->
          <div class="settings-container" ref="settingsContainer">
            <button class="settings-button" :class="{ active: isOpen }" @click="toggleDropdown" ref="settingsBtn">
              <i class="settings-icon"></i>
            </button>

            <div class="settings-dropdown" :class="{ show: isOpen }" ref="settingsDropdown">
              <a href="#" class="dropdown-item" @click="handleSettings">
                <i class="item-icon settings-icon-item"></i>
                <span>Cài đặt</span>
              </a>
              <a href="#" class="dropdown-item danger" @click="handleLogout">
                <i class="item-icon logout-icon"></i>
                <span>Đăng xuất</span>
              </a>
            </div>
          </div>

          
        </div>

        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-count">{{ currentUser?.statistics?.postCount }}</span> bài viết
          </div>
          <div class="stat-item">
            <span class="stat-count">{{ formatNumberWithK(currentUser?.statistics?.followerCount) }}</span> người theo
            dõi
          </div>
          <div class="stat-item">
            <span class="stat-count">{{ currentUser?.statistics?.followingCount }}</span> đang theo dõi
          </div>
        </div>
        <div class="profile-bio">
          <h3>{{ currentUser.fullName }}</h3>
          <p>{{ currentUser.bio }}</p>
          <p v-if="currentUser.website">Website: <a :href="currentUser.website">{{ currentUser.website }}</a></p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="profile-tabs">
      <div class="tab-item">
        <i class="grid-icon"></i>
        <router-link to="/profile">BÀI VIẾT</router-link>
      </div>
      <div class="tab-item">
        <i class="tagged-icon"></i>
        <router-link to="/profile/tag">ĐƯỢC GẮN THẺ</router-link>
      </div>
      <div class="tab-item">
        <i class="saved-icon"></i>
        <router-link to="/profile/saved">ĐÃ LƯU</router-link>
      </div>

    </div>
    <router-view></router-view>

  </div>
</template>




<style scoped>
a {
  text-decoration: none;
}

.instagram-profile {
  max-width: 1000px;
  width: 47%;
  margin-left: 520px;
  margin-top: 7px;
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  margin-bottom: 44px;
}

.profile-avatar {
  position: relative;
  margin-right: 100px;
  margin-left: 30px;
  width: 130px;
  height: 130px;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}


.profile-info {
  flex: 1;
}

.profile-username {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-username h2 {
  font-size: 28px;
  font-weight: 300;
  margin: 0;
  margin-right: 20px;
}

.edit-profile-button {
  background-color: transparent;
  border: 1px solid #dbdbdb;
  color: #262626;
  border-radius: 4px;
  padding: 5px 9px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

.settings-container {
  position: relative;
  display: inline-block;
}

.settings-button {
  background: none;
  border: none;
  cursor: pointer;
}

.settings-icon::before {
  content: "⚙️";
  font-size: 24px;
}

.settings-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px);
  visibility: hidden;
  transition: all 0.2s ease;
}

.settings-dropdown.show {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item:first-child {
  border-radius: 8px 8px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 8px 8px;
}

.dropdown-item.danger:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.item-icon {
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.settings-icon-item {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'/%3E%3C/svg%3E");
}

.logout-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d32f2f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'/%3E%3C/svg%3E");
}

/* Arrow pointing up */
.settings-dropdown::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 16px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

.settings-dropdown::after {
  content: '';
  position: absolute;
  top: -9px;
  right: 16px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #e0e0e0;
}

.profile-stats {
  display: flex;
  margin-bottom: 20px;
}

.stat-item {
  margin-right: 40px;
  font-size: 16px;
}

.stat-count {
  font-weight: 600;
}

.profile-bio h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.profile-bio p {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.profile-bio a {
  color: #00376b;
  text-decoration: none;
  font-weight: 600;
}



.profile-tabs {
  display: flex;
  justify-content: center;
  border-top: 1px solid #dbdbdb;
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 20px;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  margin: 5px 40px;
  font-size: 13px;
  font-weight: 600;
  color: #8e8e8e;
  cursor: pointer;
  letter-spacing: 1px;
}

.tab-item.active {
  color: #262626;
  border-top: 1px solid #262626;
  margin-top: -1px;
}

.grid-icon::before {
  content: "□";
  margin-right: 6px;
}

.reels-icon::before {
  content: "▶";
  margin-right: 6px;
}

.tagged-icon::before {
  content: "◊";
  margin-right: 6px;
}

.saved-icon::before {
  content: "🔖";
  margin-right: 6px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.grid-item {
  position: relative;
  aspect-ratio: 1/1;
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.grid-item:hover .hover-overlay {
  opacity: 1;
}

.grid-item:hover .post-actions {
  opacity: 1;
}

.post-stats {
  display: flex;
  color: white;
  font-weight: 600;
}

.post-stats span {
  margin: 0 10px;
  display: flex;
  align-items: center;
}

.heart-icon::before {
  content: "♥";
  margin-right: 7px;
}

.comment-icon::before {
  content: "💬";
  margin-right: 7px;
}

.bookmark-icon::before {
  content: "🔖";
}

.tag-icon::before {
  content: "👤";
}

.post-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: opacity 0.2s;
}

.action-button {
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
}

.edit-icon::before {
  content: "✏️";
}

.delete-icon::before {
  content: "🗑️";
}

.add-post-item,
.add-reel-item {
  aspect-ratio: 1/1;
  border: 2px dashed #dbdbdb;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #fafafa;
}

.add-reel-item {
  aspect-ratio: 3/5;
}

.add-post-content,
.add-reel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8e8e8e;
}

.plus-icon-large {
  font-size: 40px;
  margin-bottom: 8px;
}

.post-saved-indicator,
.tagged-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.reel-item {
  position: relative;
  aspect-ratio: 3/5;
}

.reel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-views {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.play-icon::before {
  content: "▶";
  margin-right: 7px;
}

@media (max-width: 735px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .instagram-profile {
    width: 10%;
  }

  .profile-avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .profile-username {
    justify-content: center;
    flex-wrap: wrap;
  }

  .profile-stats {
    justify-content: space-around;
  }

  .stat-item {
    margin-right: 0;
  }

  .photo-grid,
  .reels-grid {
    gap: 3px;
  }

  .profile-tabs {
    overflow-x: auto;
    justify-content: flex-start;
  }
}
</style>