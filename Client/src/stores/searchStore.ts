import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', {
  state: () => ({
    keyword: '',
    results: {
        users: [],
        posts: [],
    },
    scrollPosition: 0,
  }),
  actions: {
    async searchGlobalStore(searchQuery: string, result) {      
      this.keyword = searchQuery;      
      this.results = result;
    },
  },
});
