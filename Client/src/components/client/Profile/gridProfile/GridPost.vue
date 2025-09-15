<template>
  <div class="photo-grid">
    
    <div
      v-for="post in posts"
      :key="post._id"
      class="grid-item"
      @click="navigateToResultPost(post)"
    >
      <img
        :src="post.images[0]?.image_url"
        alt="Ảnh bài đăng"
        class="post-image"
      />
      <div class="hover-overlay">
        <div class="post-stats">
          <span><i class="heart-icon"></i>{{ post.statistics?.likeCount ?? 0 }}</span>
          <span><i class="comment-icon"></i>{{ post.statistics?.commentCount ?? 0 }}</span>
        </div>
      </div>
    </div>
    
  </div>
  <div v-if="!posts || posts.length === 0" class="no-posts-message">
      <p>Hãy thêm bài viết để cùng lan tỏa đến mọi người nhé!</p>
    </div>
  
</template>

<script setup lang="ts">

import { ref, onMounted, computed } from 'vue'
import { usePostStore } from '@/stores/postStore'
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const router = useRouter()
const postStore = usePostStore()
const authStore = useAuthStore();
const userId = authStore.user?._id || '';

const posts = computed(() => postStore.getProfilePosts(userId))
onMounted( async() => {
  if (!posts.value || posts.value.length === 0) {
    const post = await postStore.fetchPosts()
    postStore.updateProfilePostIds(post, userId)
  }
})

const navigateToResultPost = (result: any) => {  
  router.push({ path: `/${result.author.username}/${result._id}` });
};


</script>

<style scoped>
.post-popup-actions {
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
}

.dropdown-container {
  position: relative;
}

.action-btn.more-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px 8px;
}

.dropdown-menu-item {
  position: absolute;
  top: 120%; 
  right: 0;
  background-color: rgb(217, 235, 244);
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1000;
  border-radius: 6px;
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 4px 0;
}


.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
.grid-item {
  position: relative;
  aspect-ratio: 1/1;
  max-width: 280px;
  cursor: pointer;
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


/* Post Popup Styles */
.post-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.post-popup-container {
  display: flex;
  width: 90%;
  max-width: 1000px;
  height: 90vh;
  max-height: 600px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #444;
  cursor: pointer;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}


/* Left side - Image gallery */
.post-popup-gallery {
  flex: 6;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.gallery-prev {
  left: 10px;
}

.gallery-next {
  right: 10px;
}

.image-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.indicator-dot.active {
  background-color: #3897f0;
  transform: scale(1.2);
}

/* Right side - Post information */
.post-popup-info {
  flex: 4;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #efefef;
  max-width: 400px;
}

/* Header */
.post-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #efefef;
}

.post-popup-user {
  display: flex;
  align-items: center;
}

.post-popup-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.post-popup-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-popup-username {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  font-size: 14px;
}

.location {
  font-size: 12px;
  color: #8e8e8e;
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

/* Post content */
.post-popup-content {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 0;
}

.post-popup-caption {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.post-popup-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.post-tag {
  color: #3897f0;
  font-size: 14px;
  cursor: pointer;
}

.post-popup-time {
  font-size: 12px;
  color: #8e8e8e;
  margin-top: 8px;
}

/* Comments section */
.post-popup-comments {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px;
  border-top: 1px solid #efefef;
  border-bottom: 1px solid #efefef;
}

.comments-list {
  padding: 16px 0;
}

.comment-item {
  display: flex;
  margin-bottom: 16px;
}

.comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  font-size: 14px;
}

.comment-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.comment-time {
  font-size: 12px;
  color: #8e8e8e;
}

.like-comment-btn,
.reply-comment-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #8e8e8e;
  cursor: pointer;
  padding: 0;
}

.no-comments {
  padding: 20px 0;
  text-align: center;
  color: #8e8e8e;
  font-size: 14px;
}

/* Post actions bar */
.post-popup-actions-bar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
}

.post-actions-left {
  display: flex;
  gap: 16px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  padding: 0;
}

/* Custom icons */
.heart-icon-outlined::before {
  content: "♡";
}

.action-btn.active .heart-icon-outlined::before {
  content: "♥";
  color: #ed4956;
}

.comment-icon-outlined::before {
  content: "💬";
}

.share-icon::before {
  content: "↗";
}

.bookmark-icon-outlined::before {
  content: "☆";
}

.action-btn.active .bookmark-icon-outlined::before {
  content: "★";
}

/* Likes count */
.post-popup-likes {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

/* Add comment section */
.post-popup-add-comment {
  display: flex;
  padding: 16px;
  border-top: 1px solid #efefef;
}

.comment-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}

.post-comment-btn {
  background: none;
  border: none;
  color: #3897f0;
  font-weight: 600;
  cursor: pointer;
}

.post-comment-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .post-popup-container {
    flex-direction: column;
    height: 90vh;
    max-height: none;
    width: 95%;
  }
  
  .post-popup-gallery {
    flex: none;
    height: 50vh;
  }
  
  .post-popup-info {
    max-width: none;
  }
}
.no-posts-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 12px;
  /* margin: 2rem 0; */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
}

.no-posts-message::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
}

.no-posts-message p {
  font-size: 1.1rem;
  color: #4b5563;
  text-align: center;
  font-weight: 500;
  padding: 0 2rem;
  line-height: 1.5;
  max-width: 85%;
  position: relative;
}

.no-posts-message p::before {
  content: "📝";
  display: block;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

/* Hiệu ứng hover */
.no-posts-message:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

/* Thích ứng với màn hình di động */
@media (max-width: 640px) {
  .no-posts-message {
    height: 180px;
    margin: 1rem 0;
  }
  
  .no-posts-message p {
    font-size: 1rem;
  }
  
  .no-posts-message p::before {
    font-size: 2rem;
  }
}
</style>