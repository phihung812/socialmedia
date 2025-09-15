<template>
  <div class="instagram-profile">
    <!-- Header với thông tin người dùng -->
    <div class="profile-header">
      <div class="profile-avatar">
        <img
          :src="user?.avatar.avatar_url || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'"
          alt="Avatar" />
      </div>
      <div class="profile-info">
        <div class="profile-username">
          <h2>{{ user?.username }}</h2>
          <button class="follow-button" :class="{ unFollow: isFollowed }" @click="toggleFollow">{{ isFollowed ? 'Hủy theo dõi' : 'Theo dõi' }}</button>
          <button class="message-button" @click = "navigateToMessage(user)">Nhắn tin</button>
          <button class="more-options">
            <i class="menu-icon"></i>
          </button>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-count">{{ user?.statistics.postCount }}</span> bài viết
          </div>
          <div class="stat-item">
            <span class="stat-count">{{ user?.statistics.followerCount }}</span> người theo dõi
          </div>
          <div class="stat-item">
            <span class="stat-count">{{ user?.statistics.followingCount }}</span> đang theo dõi
          </div>
        </div>
        <div class="profile-bio">
          <h3>{{ user?.fullName }}</h3>
          <p>{{ user?.bio || 'Chưa có giới thiệu bản thân' }} </p>
          <p v-if="user?.website">Website: <a href="#">{{ user.website }}</a></p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="profile-tabs">
      <div class="tab-item active">
        <i class="grid-icon"></i> BÀI VIẾT
      </div>
      <div class="tab-item">
        <i class="reels-icon"></i> REELS
      </div>
      <div class="tab-item">
        <i class="tagged-icon"></i> ĐƯỢC GẮN THẺ
      </div>
    </div>

    <!-- List Post -->
    <div class="list-post">
      <div v-for="(post, index) in listPosts" :key="index" class="post-container">
        <div class="result-posts-header">
          <div class="result-posts-avatar">
            <img
              :src="post.author.avatar || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'"
              alt="Avatar" />
          </div>
          <div class="result-posts-name">
            <h4>{{ post.author.fullName }}</h4>
            <span>{{ formatTime(post.createdAt) }}</span>
          </div>
        </div>
        <div v-if="post.caption" class="posts-caption">
          <p>{{ post.caption }}</p>
        </div>
        <div v-if="post.images && post.images.length > 0" class="image-gallery-container">
          <div class="image-gallery-scroll" ref="galleryRef">
            <div v-for="(image, imgIndex) in post.images" :key="imgIndex" class="image-item" :class="{
              'image-item-one': post.images.length === 1,
              'image-item-two': post.images.length === 2,
              'image-item': post.images.length > 2,
            }" @click="openImageModal(post.images, imgIndex)">
              <img :src="image.image_url" alt="" />
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="result-actions">
          <div class="action-button like-button" :class="{ active: post.liked }" @click="toggleLike(post)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor" stroke-width="2" />
            </svg>
            <span>{{ post.statistics.likeCount }}</span>
          </div>
          <div class="action-button" @click="navigateToResultPost(post)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z"
                stroke="currentColor" stroke-width="2" />
              <path
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                fill="currentColor" />
              <path
                d="M6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12C5 12.5523 5.44772 13 6 13Z"
                fill="currentColor" />
              <path
                d="M18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12C17 12.5523 17.4477 13 18 13Z"
                fill="currentColor" />
            </svg>
            <span>{{ post.statistics.commentCount }}</span>
          </div>
          <div class="action-button">
            <i style="font-size: 18px;" class="far fa-paper-plane"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, reactive, ref } from 'vue'
import { getUserProfile } from '@/service/user.service'
import { getPostsByUserProfileUser } from '@/service/post.service'
import { follow, unfollow } from '@/service/follow.service'
import { likePost, unlikePost } from '@/service/like.service'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'

const postStore = usePostStore()
const user = ref<UserProfile | null>(null);
const userId = ref();
const isFollowed = ref(false);
const currentImageIndex = reactive({})
const galleryRef = ref([])

const route = useRoute()
const router = useRouter()

interface Avatar {
  avatar_url: string;
  avatar_public_id: string;
}
interface UserProfile {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  website: string;
  statistics: {
    postCount: number;
    followerCount: number;
    followingCount: number;
  };
  isPrivate: boolean;
  isVerified: boolean;
  avatar: Avatar;
}

interface Author {
  userId: string;
  username: string;
  fullName: string;
  avatar?: string;
}

interface PostImage {
  image_url: string;
  image_public_id: string;
  _id: string;
}

interface PostStatistics {
  likeCount: number;
  commentCount: number;
}

interface PostResponse {
  _id: string;
  author: Author;
  caption: string;
  images: PostImage[];
  tags: string[];
  privacy: 'public' | 'private' | 'friends';
  statistics: PostStatistics;
  mentionedUsers: string[];
  createdAt: string;
  updatedAt: string;
  liked: boolean;
}


const listPosts = computed(() => postStore.getProfilePosts(userId.value))

onMounted(async () => {
  const username = route.params.username as string;
  const userProfile = await getUserProfile(username);

  if (userProfile) {
    user.value = userProfile.user;
    
    userId.value = userProfile.user._id;
    isFollowed.value = userProfile.followStatus?.isFollowed ?? false;

    const resultPost = await getPostsByUserProfileUser(userProfile.user._id);

    postStore.updateProfilePostIds(resultPost, userId.value)
  }
})



onMounted(() => {
  nextTick(() => {
    const galleries = document.querySelectorAll('.image-gallery-scroll')

    galleries.forEach((gallery, postIndex) => {
      currentImageIndex[postIndex] = 0

      gallery.addEventListener('scroll', () => {
        const scrollLeft = gallery.scrollLeft
        const imageItem = gallery.querySelector('.image-item') as HTMLElement
        const itemWidth = imageItem?.offsetWidth || 0
        const gap = 8 // Gap between images
        const currentIndex = Math.round(scrollLeft / (itemWidth + gap))
        currentImageIndex[postIndex] = currentIndex
      })
    })
  })
})

const toggleFollow = async () => {
  try {
    if (isFollowed.value) {
      await unfollow(userId.value)
      isFollowed.value = false;
    } else {
      await follow(userId.value);
      isFollowed.value = true;
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái follow:', error);
  }
}


const toggleLike = async (post: PostResponse) => {
  if (!post) return;
  const isLiked = !post.liked;

  try {
    if (isLiked) {
      await likePost(post._id);
    } else {
      await unlikePost(post._id);
    }
    const updatedLikeCount = post.statistics.likeCount + (isLiked ? 1 : -1);

    post.liked = isLiked;
    post.statistics.likeCount = updatedLikeCount;

    postStore.updatePostMapField(post._id, {
      liked: isLiked,
      statistics: {
        ...post.statistics,
        likeCount: updatedLikeCount
      }
    });
  } catch (error) {
    console.error('Lỗi khi like/unlike:', error);
  }
}

const navigateToResultPost = (result: any) => {
  router.push({ path: `/${result.author.username}/${result._id}` });
};

const navigateToMessage = (result: any) => {  
  router.push({ path: `/message/${result.username}` });
};


const openImageModal = (images: any, index: any) => {
  console.log('Opening image modal:', images, index);
  // Implement your image modal logic here
};

const formatTime = (date: string | number | Date): string => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

</script>


<style scoped>
.like-button.active svg {
  color: #ED4956;
  fill: #ED4956;
}

.post-container {
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.result-posts-header {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.result-posts-avatar img {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  object-fit: cover;
}

.result-posts-name h4 {
  margin: 0;
  font-weight: 600;
  color: #333;
  font-size: 19px;
}

.result-posts-name span {
  color: #666;
  font-size: 15px;
}

.posts-caption {
  padding: 0 16px 16px;
}

.posts-caption p {
  margin: 0;
  color: #333;
  line-height: 1.5;
  font-size: 17px;
}

/* Image Gallery Styles */
.image-gallery-container {
  position: relative;
  margin-bottom: 16px;
  width: 100%;
  overflow: hidden;
  /* Prevent overflow */
}

.image-gallery-scroll {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 8px;
  padding: 0 16px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
  width: 100%;
  box-sizing: border-box;
}

.image-gallery-scroll::-webkit-scrollbar {
  display: none;
  /* Chrome/Safari/Opera */
}

.image-item {
  flex: 0 0 auto;
  width: min(280px, calc(80vw - 32px));
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-sizing: border-box;
}

.image-item-one {
  flex: 0 0 auto;
  width: min(722px, calc(80vw - 32px));
  height: 550px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-sizing: border-box;
}

.image-item-two {
  flex: 0 0 auto;
  width: min(340px, calc(80vw - 32px));
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-sizing: border-box;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-item-one img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-item-two img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Scroll Indicators */
.scroll-indicators {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
}


/* Action buttons */
.result-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #666;
}

.action-button:hover {
  background-color: #f5f5f5;
}

.action-button svg {
  width: 20px;
  height: 20px;
}

.like-button.active {
  color: #e74c3c;
}

.like-button.active svg path {
  fill: #e74c3c;
}

/* Responsive */
@media (max-width: 768px) {
  .image-item {
    width: min(250px, calc(75vw - 24px));
    height: 250px;
  }

  .image-gallery-scroll {
    padding: 0 12px;
  }
}

@media (max-width: 480px) {
  .image-item {
    width: min(200px, calc(70vw - 24px));
    height: 200px;
  }

  .image-gallery-scroll {
    padding: 0 8px;
  }
}




.follow-button.unFollow {
  background-color: red;
  color: white;
}

.instagram-profile {
  max-width: 1000px;
  width: 795px;
  margin-left: 520px;
  padding: 30px 20px;
  margin-top: 7px;
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
  margin-right: 100px;
  margin-left: 55px;
  width: 150px;
  height: 150px;
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


.follow-button,
.message-button {
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 9px;
  font-weight: 600;
  font-size: 17px;
  margin-right: 10px;
  cursor: pointer;
}

.message-button {
  background-color: transparent;
  color: #262626;
  border: 1px solid #dbdbdb;
}

.more-options {
  background: none;
  border: none;
  cursor: pointer;
}

.menu-icon::before {
  content: "•••";
  font-size: 14px;
}

.profile-stats {
  display: flex;
  margin-bottom: 20px;
}

.stat-item {
  margin-right: 40px;
  font-size: 17px;
}

.stat-count {
  font-weight: 600;
}

.profile-bio h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.profile-bio p {
  margin: 0 0 5px 0;
  font-size: 15px;
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

.list-post {
  border-top: 1px solid #dbdbdb;

}

.image-gallery {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  display: grid;
  gap: 2px;
}

.single-image {
  grid-template-columns: 1fr;
}

.two-images {
  grid-template-columns: 1fr 1fr;
}

.three-images {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.three-images .image-item:first-child {
  grid-row: 1 / 3;
}

.multiple-images {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.image-item {
  cursor: pointer;
  overflow: hidden;
  background: #f7f7f7;
  aspect-ratio: 4/3;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}




@media (max-width: 735px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
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
    justify-content: center;
  }

  .photo-grid {
    gap: 3px;
  }
}
</style>