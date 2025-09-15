<template>
  <div class="photo-grid">
    <div v-for="post in savedPosts" :key="post._id" class="grid-item" @click="navigateToResultPost(post)">
      <img :src="post.images[0].image_url" alt="Đã lưu" />
      <div class="hover-overlay">
        <div class="post-stats">
          <span><i class="heart-icon"></i>{{ post.statistics.likeCount }}</span>
          <span><i class="comment-icon"></i>{{ post.statistics.commentCount }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePostStore } from '@/stores/postStore'
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { getSavedPostByUserId } from '@/service/post.service';

const router = useRouter()
const postStore = usePostStore()
const authStore = useAuthStore();
const userId = authStore.user?._id || '';

const savedPosts = computed(() => postStore.getSavedPosts(userId))
onMounted(async () => {    
    const data = await getSavedPostByUserId();
    postStore.updateSavedPostIds(data.savedPosts, userId)
})

const navigateToResultPost = (result: any) => {  
  router.push({ path: `/${result.author.username}/${result.postId}` });
};
</script>

<style scoped>
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

.add-post-item, .add-reel-item {
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

.add-post-content, .add-reel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8e8e8e;
}

.plus-icon-large {
  font-size: 40px;
  margin-bottom: 8px;
}
</style>