import { Post } from '@/views/Search.vue';
import { defineStore } from 'pinia';
import { getListPostByUserId } from '@/service/post.service';
import { searchGlobal } from '@/service/search.service';

export const usePostStore = defineStore('post', {
  state: () => ({
    postsMap: {} as Record<string, Post>,
    homePostIds: [] as string[], // [postId]
    profilePostIds: {} as Record<string, string[]>, // { userId: [postId] }
    savedPostIds: {} as Record<string, string[]>,
    searchPostIds: [] as string[],
    isLoading: true,
    isAuthenticated: false,
  }),
  actions: {
    async fetchPosts() {
      this.isLoading = true;
      try {
        const result = await getListPostByUserId();
        return result;
      } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
      } finally {
        this.isLoading = false;
      }
    },
    addPostsToMap(posts: Post[]) {
      posts.forEach((post) => {
        this.postsMap[post._id] = post;
      });
    },

    // vừa thêm vào postMap vừa thêm vào searchPostIds
    updateSearchPostIds(posts: Post[]) {
      this.searchPostIds = posts.map((post) => post._id);
      posts.forEach((post) => {
        this.postsMap[post._id] = post;
      });
    },

    updateHomePostIds(posts: Post[]) {
      this.homePostIds = posts.map((post) => post._id);
      posts.forEach((post) => {
        this.postsMap[post._id] = post;
      });
    },

    updateProfilePostIds(posts: Post[], userId: string) {
      this.profilePostIds[userId] = posts.map((post) => post._id);
      posts.forEach((post) => {
        this.postsMap[post._id] = post;
      });
    },

    updateSavedPostIds(posts: Post[], userId: string) {
      console.log(posts);
      
      this.savedPostIds[userId] = posts.map((post) => post._id);
      posts.forEach((post) => {
        this.postsMap[post._id] = post;
      });
    },

    updatePostMapField(postId: string, partial: Partial<Post>) {
      if (this.postsMap[postId]) {
        Object.assign(this.postsMap[postId], partial);
      }
    },

    deletePostById(postId: string) {
      delete this.postsMap[postId];

      this.homePostIds = this.homePostIds.filter((id) => id !== postId);

      Object.keys(this.profilePostIds).forEach((userId) => {
        this.profilePostIds[userId] = this.profilePostIds[userId].filter(
          (id) => id !== postId
        );
      });

      this.searchPostIds = this.searchPostIds.filter((id) => id !== postId);
    },
  },
  getters: {
    searchPosts(state): Post[] {
      return state.searchPostIds
        .map((id) => state.postsMap[id])
        .filter((post) => post !== undefined);
    },

    getProfilePosts: (state) => {
      return (userId: string): Post[] => {
        const ids = state.profilePostIds[userId] || [];
        return ids.map((id) => state.postsMap[id]).filter(Boolean);
      };
    },

    getSavedPosts: (state) => {
      return (userId: string): Post[] => {
        const ids = state.savedPostIds[userId] || [];
        return ids.map((id) => state.postsMap[id]).filter(Boolean);
      };
    },
  },
  persist: true,
});
