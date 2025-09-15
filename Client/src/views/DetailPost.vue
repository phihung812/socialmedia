<template>
  <div v-if="isLoading || isPostLoading">
    <h2>Đang load...</h2>
  </div>
  <div v-else-if="post" class="post-detail-container">
    <!-- Header -->
    <header class="post-header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <h1>Bài viết</h1>
    </header>

    <!-- Main Post -->
    <div class="main-post">

      <AuthorPost :post="post" :currentUserId="userId" />

      <ContentPost :post="post" @openImageModal="handleOpenImageModal" />

      <PostAction :post="post" :userId="userId" />
    </div>

    <CommentPost :currentUser="currentUser" :post="post" />

    <!-- Image Modal -->
    <ImageModal :post="post" v-model:showImageModal="showImageModal" v-model:currentImageIndex="currentImageIndex" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { detailPost, deletePost } from '@/service/post.service'
import { getCommentToPost, createComment } from '@/service/comment.service'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'
import { useAuthStore } from '@/stores/authStore';
import { useCommentStore } from '@/stores/commentStore';
import { Comment } from '@/stores/commentStore'
import { Post } from '@/views/Search.vue'

import AuthorPost from '@/components/client/detailPost/mainPost/AuthorPost.vue'
import ContentPost from '@/components/client/detailPost/mainPost/ContentPost.vue'
import PostAction from '@/components/client/detailPost/mainPost/PostAction.vue'
import CommentPost from '@/components/client/detailPost/comment/CommentPost.vue'
import ImageModal from '@/components/client/detailPost/imageModal/ImageModal.vue'

const route = useRoute()
const router = useRouter()
const showImageModal = ref(false)
const currentImageIndex = ref(0)
const showMoreOptions = ref(false)
const post = ref<Post | null>(null)

const userStore = useUserStore()
const { currentUser, isLoading } = storeToRefs(userStore)
const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
const isPostLoading = ref(true)
const authStore = useAuthStore();
const userId = authStore.user?._id || '';


onMounted(async () => {
  try {
    isPostLoading.value = true
    const result = await detailPost(postId)
    
    post.value = result
  } catch (err) {
    console.error('Error loading post:', err)
  } finally {
    isPostLoading.value = false
  }
})

const handleOpenImageModal = (index) => {
  currentImageIndex.value = index
  showImageModal.value = true
}

const goBack = () => {
  router.go(-1)
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.more-options-wrapper')) {
    showMoreOptions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.post-detail-container {
  max-width: 50%;
    width: 50%;
    margin-left: 520px;
  background: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);

}

.post-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e1e8ed;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-right: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f7f7f7;
}

.post-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #0f1419;
}

.main-post {
  padding: 20px;
  border-bottom: 1px solid #e1e8ed;
}


@media (max-width: 768px) {
  .post-detail-container {
    max-width: 100%;
  }

  .post-header {
    padding: 12px 16px;
  }

  .main-post {
    padding: 16px;
  }

  .comment-input-section {
    padding: 12px 16px;
  }

  .comments-section {
    padding: 16px;
  }

  .replies-list {
    margin-left: 40px;
    padding-left: 16px;
  }

  .more-options-dropdown {
    right: -20px;
  }
}
</style>