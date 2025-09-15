<template>
  <div class="sidebar">
    <div class="logo">
      <h1>Mevu</h1>
    </div>
    <div class="menu">
      <div class="menu-item active">
        <i class="fas fa-home"></i>
        <router-link to="/">Home</router-link>
      </div>
      <div class="menu-item">
        <i class="fas fa-search"></i>
        <router-link to="/search">Search</router-link>
      </div>
      <div class="menu-item">
        <i class="fas fa-paper-plane"></i>
        <span>Messages</span>
        <span class="message-count">5</span>
      </div>
      <div class="menu-item">
        <i class="fas fa-heart"></i>
        <span>Notifications</span>
      </div>
      <div class="menu-item" @click="openFileSelector">
        <i class="fas fa-plus-square"></i>
        <span>Create</span>
      </div>
      <div class="menu-item">
        <div class="profile-img">
          <img src="" alt="Profile" />
        </div>
        <router-link to="/profile">Profile</router-link>
      </div>
    </div>
    
    <!-- File input (hidden) -->
    <input 
      type="file" 
      ref="fileInput" 
      accept="image/*" 
      style="display: none;"
      @change="handleFileSelected"
      multiple
    />
    
    <!-- Create Post Modal -->
    <div v-if="showCreatePostModal" class="modal-overlay">
      <div class="create-post-modal">
        <div class="modal-header">
          <h3>Create new post</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="post-options">
          <div class="option" @click="isDropdownOpen = !isDropdownOpen">
            <span>Tag people</span>
            <i class="fas fa-caret-down"></i>
          </div>
          <div class="dropdown" v-if="isDropdownOpen">
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="Tìm bạn bè..."
              class="search-box"
            />

            <ul v-if="filteredFriends.length > 0">
              <li v-for="friend in filteredFriends" :key="friend.id">
                <img :src="friend.avatar" class="avatar" />
                <span>{{ friend.name }}</span>
              </li>
            </ul>
            <p v-else class="no-result">Không tìm thấy bạn nào</p>
          </div>


          <div class="option" @click="isPrivacyDropdownOpen = !isPrivacyDropdownOpen">
            <span class="icon-text">
              <span class="icon">{{ selectedOption.icon }}</span>
              <span>{{ selectedOption.label }}</span>
            </span>
            <i class="fas fa-caret-down"></i>
          </div>

          <div class="dropdown" v-if="isPrivacyDropdownOpen">
            <div class="radio-group">
              <label
                v-for="option in privacyOptions"
                :key="option.value"
                class="radio-option"
              >
                <input
                  type="radio"
                  name="privacy"
                  :value="option.value"
                  v-model="selectedPrivacy"
                  @change="handlePrivacyChange"
                />
                <span class="label-text">
                  <span class="icon">{{ option.icon }}</span>
                  <span>{{ option.label }}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="modal-content">
          <div class="post-preview">
            <!-- Image carousel for multiple images -->
            <div class="image-carousel" v-if="selectedImages.length > 0">
              <img 
                :src="selectedImages[currentImageIndex]" 
                alt="Post preview" 
                class="preview-image" 
              />
              
              <!-- Navigation arrows for multiple images -->
              <div class="carousel-navigation" v-if="selectedImages.length > 1">
                <button 
                  class="nav-btn prev" 
                  @click="prevImage" 
                  :disabled="currentImageIndex === 0"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button 
                  class="nav-btn next" 
                  @click="nextImage" 
                  :disabled="currentImageIndex === selectedImages.length - 1"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              
              <div class="image-counter" v-if="selectedImages.length > 1">
                {{ currentImageIndex + 1 }}/{{ selectedImages.length }}
              </div>
              
              <button class="remove-image-btn" @click="removeCurrentImage">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="post-details">
            <div class="user-info">
              <div class="profile-img small">
                <img :src="currentUser.avatar?.avatar_url" alt="ảnh" />
              </div>
              <span class="username">{{ currentUser.fullName }}</span>
            </div>
            <div class="caption-container">
              <textarea 
                placeholder="Write a caption..." 
                v-model="caption"
                class="caption-input"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="share-btn" @click="sharePost" :disabled="selectedFiles.length === 0 || isUploading">
            {{ isUploading ? 'Posting...' : 'Share' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia';
import { createPost } from '@/service/post.service';
import { onClickOutside } from '@vueuse/core'
import { usePostStore } from '@/stores/postStore';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)
const postStore = usePostStore()

const fileInput = ref<HTMLInputElement | null>(null);
const showCreatePostModal = ref(false);
const currentImageIndex = ref(0);
const caption = ref('');
const isUploading = ref(false);
const selectedFiles = ref<File[]>([]);
const selectedImages = ref<string[]>([]);

const openFileSelector = () => {
  if (fileInput.value){
    fileInput.value.click();
  }
};

// const handleFileSelected = (event) => {
//   const files = event.target.files;
//   if (files && files.length > 0) {
//     selectedFiles.value = Array.from(files);
    
//     selectedImages.value = [];
//     currentImageIndex.value = 0;
    
//     Array.from(files).forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         selectedImages.value.push(e.target.result);
//       };
//       reader.readAsDataURL(file);
//     });
    
//     showCreatePostModal.value = true;
//   }
// };

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    selectedFiles.value = Array.from(files);

    selectedImages.value = [];
    currentImageIndex.value = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fr = e.target as FileReader;
        if (fr.result && typeof fr.result === 'string') {
          selectedImages.value.push(fr.result); // base64 string
        }
      };

      reader.readAsDataURL(file); // <== Đọc file ảnh thành base64
    });

    showCreatePostModal.value = true;
  }
};


const nextImage = () => {
  if (currentImageIndex.value < selectedImages.value.length - 1) {
    currentImageIndex.value++;
  }
};

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const removeCurrentImage = () => {
  selectedImages.value.splice(currentImageIndex.value, 1);
  selectedFiles.value.splice(currentImageIndex.value, 1);
  
  if (currentImageIndex.value >= selectedImages.value.length) {
    currentImageIndex.value = Math.max(0, selectedImages.value.length - 1);
  }
  
  if (selectedImages.value.length === 0) {
    closeModal();
  }
};

const closeModal = () => {
  showCreatePostModal.value = false;
  selectedImages.value = [];
  selectedFiles.value = [];
  currentImageIndex.value = 0;
  caption.value = '';
  isUploading.value = false;
};

const sharePost = async () => {  
  
  if (selectedFiles.value.length === 0) {
    alert('Vui lòng chọn ít nhất một hình ảnh');
    return;
  }
  
  try {
    isUploading.value = true;
    
    const formData = new FormData();
    formData.append('caption', caption.value);
    formData.append('privacy', selectedPrivacy.value);

    selectedFiles.value.forEach(file => {
      formData.append('images', file);
    });
    
    const res = await createPost(formData); 
    const post = await postStore.fetchPosts()
    
    const userId = authStore.user?._id || '';
    postStore.updateProfilePostIds(post, userId) 
    alert(res.message)
     
    closeModal();
  } catch (error) {
    console.error(error);
    
  } finally {
    isUploading.value = false;
  }
};

const isDropdownOpen = ref(false)
const searchKeyword = ref('')


const friends = ref([
  { id: 1, name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
  { id: 2, name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c952?w=40&h=40&fit=crop&crop=face' }
])
const filteredFriends = computed(() =>
  friends.value.filter(friend =>
    friend.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
)



const isPrivacyDropdownOpen = ref(false)
const selectedPrivacy = ref('public')
const privacyDropdownRef = ref(null)

const privacyOptions = [
  { label: 'Public', value: 'public', icon: '🌍' },
  { label: 'Just me', value: 'just_me', icon: '🔒' },
  { label: 'Friend', value: 'friend', icon: '👥' }
]

const selectedOption = computed(() => {
  return privacyOptions.find(p => p.value === selectedPrivacy.value) ?? {
    label: 'Privacy settings',
    icon: '⚙️'
  }
})


onClickOutside(privacyDropdownRef, () => {
  isPrivacyDropdownOpen.value = false
})


function handlePrivacyChange() {
  isPrivacyDropdownOpen.value = false
}

</script>

<style scoped>
.sidebar {
  width: 270px;
  height: 100vh;
  background-color: white;
  border-right: 1px solid #dbdbdb;
  position: fixed;
  padding: 25px 12px;
  display: flex;
  flex-direction: column;
}
.logo {
  margin-bottom: 30px;
  padding-left: 12px;
}
.logo h1 {
  font-family: 'Roboto', cursive;
  font-size: 24px;
  font-weight: 500;
}
.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.menu-item:hover {
  background-color: #f2f2f2;
}
.menu-item.active {
  font-weight: 500;
}
.menu-item i {
  font-size: 22px;
  margin-right: 16px;
  width: 24px;
  text-align: center;
}
.menu-item span {
  font-size: 16px;
}
.menu-item a {
  color: black;
  font-size: 16px;
}
.profile-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
}
.profile-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-img.small {
  width: 32px;
  height: 32px;
}
.message-count {
  background-color: #ff3040;
  color: white;
  font-size: 12px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.create-post-modal {
  background-color: white;
  border-radius: 12px;
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  border-bottom: 1px solid #dbdbdb;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-weight: 500;
  font-size: 16px;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

.modal-content {
  display: flex;
  max-height: 70vh;
}

.post-preview {
  flex: 1;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.post-details {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.user-info {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dbdbdb;
}

.username {
  font-weight: 600;
  font-size: 14px;
}

.caption-container {
  padding: 16px;
  flex-grow: 1;
}

.caption-input {
  width: 100%;
  min-height: 10px;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
}

.post-options {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  width: 280px;
  font-family: Arial, sans-serif;
  margin-top: 12px;
}

.option:last-child {
  border-bottom: none;
}

.modal-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
}

.share-btn {
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  top: -60px;
}

.share-btn:hover {
  background-color: #0081d6;
}

.image-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
}

.carousel-navigation {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  z-index: 2;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 10px;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-counter {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.search-box {
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 14px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: calc(5 * 46px); 
  overflow-y: auto;
  scrollbar-width: none;
}

ul::-webkit-scrollbar {
  display: none; 
}


li {
  display: flex;
  align-items: center;
  padding: 8px 6px;
  cursor: pointer;
  border-radius: 6px;
}

li:hover {
  background-color: #f5f5f5;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.no-result {
  text-align: center;
  color: #888;
  font-size: 14px;
  padding: 10px 0;
}

.option {
  padding: 10px 12px;
  /* background-color: #f0f0f0; */
  cursor: pointer;
  border-radius: 8px;
  /* border: 1px solid #ccc; */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-option {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.radio-option:hover {
  background-color: #f5f5f5;
}

.radio-option input[type='radio'] {
  margin-right: 8px;
  accent-color: #007bff; /* Màu xanh đẹp cho radio */
}

.label-text {
  font-size: 15px;
}
.icon-text, .label-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon {
  font-size: 18px;
  width: 22px;
  text-align: center;
}

</style>