<template>
  <div class="search-container">
    <div class="search-header">
      <div class="search-input-container">
        <div class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input type="text" class="search-input" v-model="searchQuery" placeholder="Tìm kiếm..." @input="onSearchInput"
          @keydown.enter="performSearch" />
        <button v-if="searchQuery" class="clear-button" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="!searchQuery && !isSearching && !hasSearched" class="search-empty-state">
      <div class="search-placeholder">
        <h2>Tìm kiếm</h2>

        <div v-if="searchHistory.length > 0" class="search-history">
          <h3>Tìm kiếm gần đây</h3>
          <ul class="history-list">
            <li v-for="(item, index) in searchHistory" :key="index" @click="selectHistoryItem(item)"
              class="history-item">
              <div class="history-item-text">{{ item }}</div>
              <button class="remove-history" @click.stop="removeHistoryItem(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </li>
          </ul>
        </div>

        <div class="search-suggestions">
          <h3>Gợi ý tìm kiếm</h3>
          <ul class="suggestion-list">
            <li v-for="(suggestion, index) in suggestions" :key="index" @click="selectSuggestion(suggestion)"
              class="suggestion-item">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else-if="isSearching" class="search-loading">
      <div class="loading-spinner"></div>
      <p>Đang tìm kiếm...</p>
    </div>

    <div v-else-if="hasSearched && isEmptyResult" class="search-no-results">
      <p>Không tìm thấy kết quả cho "{{ searchQuery }}"</p>
    </div>

    <div v-else-if="hasSearched && !isEmptyResult" class="search-no-results">
      <div class="results-container">
        <div class="result-search-user" v-if="searchResults.users.length > 0">
          <div class="title-result-user">
            <h4>Mọi người</h4>
          </div>
          <div v-for="(user, index) in searchResults.users" :key="index" class="result-item"
            @click="navigateToResultUser(user)">
            <div class="result-avatar">
              <img
                :src="user.avatar?.avatar_url || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'"
                alt="Avatar" />
            </div>
            <div class="result-content">
              <div class="result-header">
                <h4>{{ user.fullName }}</h4>
              </div>
              <div class="result-meta">
                <span class="result-comments"> Bạn chung</span>
              </div>
            </div>
          </div>
        </div>

        <div class="result-search-post" v-if="searchResults.posts.length > 0">
          <div class="title-result-post">
            <h4>Bài viết</h4>
          </div>
          <div class="list-post">
            <div v-for="(post, index) in searchResults.posts" :key="index" class="post-container">
              <div class="result-posts-header" @click="navigateToResultUser(post.author)">
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
                    <path
                      d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z"
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

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { likePost, unlikePost } from '@/service/like.service'
import { useSearchStore } from '@/stores/searchStore'
import { usePostStore } from '@/stores/postStore';
import { searchGlobal } from '@/service/search.service';

const searchStore = useSearchStore()
const postStore = usePostStore()
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const isSearching = ref(false);
const hasSearched = ref(false);
const searchHistory = ref<string[]>([]);
const currentImageIndex = reactive({})


const isEmptyResult = ref(false);
interface User {
  id: number;
  fullName: string;
  avatar?: {
    avatar_url?: string;
  };
}

interface Author {
  userId: string;
  username: string;
  fullName: string;
  avatar?: string;
}

interface Image {
  image_url: string;
  image_public_id: string;
  _id: string;
}

export interface Statistics {
  likeCount: number;
  commentCount: number;
}

export interface Post {
  _id: string;
  userId: string;
  author: Author;
  caption: string;
  images: Image[];
  tags: string[];
  privacy: 'public' | 'private' | 'friends';
  statistics: Statistics;
  mentionedUsers: string[];
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  saved?: boolean;
  followed?: boolean;
}


interface SearchResults {
  users: User[];
  posts: Post[];
}

const searchResults = ref<SearchResults>({
  users: [],
  posts: [],
});


const suggestions = ref([
  'Thời trang mùa hè',
  'Công nghệ mới',
  'Du lịch trong nước',
  'Ẩm thực đường phố',
  'Sức khỏe và thể thao'
]);

const toggleLike = async (post: Post) => {
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


// Lấy dữ liệu lịch sử tìm kiếm từ localStorage
const loadSearchHistory = () => {
  const storedHistory = localStorage.getItem('searchHistory');
  if (storedHistory) {
    searchHistory.value = JSON.parse(storedHistory);
  }
};

// Lưu lịch sử tìm kiếm vào localStorage
const saveSearchHistory = () => {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
};

// Thêm query vào lịch sử tìm kiếm
const addToSearchHistory = (query: string) => {
  if (!query.trim()) return;

  // Xóa nếu đã tồn tại và thêm vào đầu
  const index = searchHistory.value.indexOf(query);
  if (index !== -1) {
    searchHistory.value.splice(index, 1);
  }

  // Thêm vào đầu mảng
  searchHistory.value.unshift(query);

  // Giới hạn số lượng lịch sử
  if (searchHistory.value.length > 5) {
    searchHistory.value = searchHistory.value.slice(0, 5);
  }

  saveSearchHistory();
};

// Xóa khỏi lịch sử tìm kiếm
const removeHistoryItem = (index: number) => {
  searchHistory.value.splice(index, 1);
  saveSearchHistory();
};

// Chọn từ lịch sử tìm kiếm
const selectHistoryItem = (query: string) => {
  searchQuery.value = query;
  performSearch();
};

// Chọn từ gợi ý
const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  performSearch();
};

// Thực hiện tìm kiếm
const performSearch = async () => {
  const keyword = searchQuery.value.trim();
  if (!keyword) return;

  if (
    searchStore.keyword === keyword &&
    Object.values(searchStore.results).some(arr => arr.length > 0)
  ) {
    const searchResultsPost = computed(() => postStore.searchPosts);
    searchResults.value = {
      users: searchStore.results.users ?? [],
      posts: searchResultsPost.value ?? [],
    };
    hasSearched.value = true;
    return;
  }

  isSearching.value = true;
  try {
    router.push({
      path: '/search',
      query: { query: searchQuery.value }
    });

    const result = await searchGlobal({ query: searchQuery.value });

    await searchStore.searchGlobalStore(searchQuery.value, result);
    await postStore.updateSearchPostIds(result.posts)

    const searchResultsPost = computed(() => postStore.searchPosts);

    searchResults.value = {
      users: result.users ?? [],
      posts: searchResultsPost.value ?? [],
    };

    isEmptyResult.value = Object.values(searchResults.value).every(arr => arr.length === 0);
    addToSearchHistory(searchQuery.value);

  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
  } finally {
    hasSearched.value = true;
    await nextTick();
    isSearching.value = false;
  }
};

// tự động tìm kiếm khi Back 
onMounted(() => {
  const q = route.query.query as string;
  if (q && searchQuery.value !== q) {
    searchQuery.value = q;
    performSearch();
  }
});


// Xử lý khi người dùng nhập
const onSearchInput = () => {
  // Nếu xóa hết thì cập nhật URL để quay về trạng thái ban đầu
  if (!searchQuery.value) {
    router.push({ path: '/search' });
    hasSearched.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  hasSearched.value = false;
  router.push({ path: '/search' });
};

const navigateToResultUser = (result: any) => {
  router.push({ path: `/${result.username}` });
};

const navigateToResultPost = (result: any) => {
  router.push({ path: `/${result.author.username}/${result._id}` });
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
  return `${days} ngày`
}

// Khởi tạo dữ liệu từ route
onMounted(() => {
  // Tải lịch sử tìm kiếm
  loadSearchHistory();

  // Kiểm tra query trên URL
  const query = route.query.query as string;
  if (query) {
    searchQuery.value = query;
    performSearch();
  }
});

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

// Theo dõi thay đổi route
watch(
  () => route.query,
  (newQuery) => {
    const query = newQuery.query as string;
    if (query && query !== searchQuery.value) {
      searchQuery.value = query;
      performSearch();
    }
  }
);
</script>

<style scoped>
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
  cursor: pointer;
}

.result-posts-avatar img {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  object-fit: cover;
}

.result-posts-name h4 {
  font-size: 19px;
  margin: 0;
  font-weight: 600;
  color: #333;
}

.result-posts-name span {
  color: #666;
  font-size: 15px;
  margin-left: -85px;
}

.posts-caption {
  padding: 0 16px 16px;
}

.posts-caption p {
  margin: 0;
  color: #333;
  line-height: 1.5;
  text-align: left;
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
  width: min(720px, calc(80vw - 32px));
  height: 500px;
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




.search-container {
  max-width: 50%;
  width: 47%;
  margin-left: 520px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);

}

.search-header {
  position: sticky;
  top: 0;
  background-color: #fff;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  z-index: 10;
}

.search-input-container {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 8px 16px;
  position: relative;
}

.search-icon {
  margin-right: 10px;
  color: #666;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
  padding: 5px 0;
}

.clear-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.search-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.search-placeholder {
  width: 100%;
}

.search-placeholder h2 {
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
}

.search-history h3,
.search-suggestions h3 {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 500;
}

.history-list,
.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 10px;
  cursor: pointer;
}

.history-item:hover {
  background-color: #f0f0f0;
}

.history-item-text {
  flex: 1;
}

.remove-history {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
}

.suggestion-item {
  padding: 12px 15px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 10px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
}

.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #333;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.search-no-results {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.title-result-user {
  text-align: left;
  margin-bottom: 15px;
}

.title-result-user h4 {
  color: rgb(39, 38, 38);
}

.title-result-post {
  text-align: left;
  margin-top: 50px;
  margin-bottom: 15px;
}

.title-result-post h4 {
  color: rgb(39, 38, 38);
}

.result-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f9f9f9;
}

.result-avatar {
  margin-right: 15px;
}

.result-avatar img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}

.result-content {
  flex: 1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  margin-top: 10px;
}

.result-header h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.result-date {
  font-size: 14px;
  color: #777;
}

.result-description {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #333;
  line-height: 1.4;
}

.result-meta {
  display: flex;
  font-size: 14px;
  color: #777;
}

.result-likes {
  margin-right: 15px;
}

@media (max-width: 600px) {
  .search-container {
    padding: 15px;
  }

  .result-avatar img {
    width: 40px;
    height: 40px;
  }

  .result-header h4 {
    font-size: 15px;
  }

  .result-description {
    font-size: 14px;
  }
}
</style>