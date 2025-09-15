<template>
  <div class="main-content">
    <div class="posts">
      <Post v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
  <!-- <SuggestionSection /> -->
</template>

<script setup>
import Post from '@/components/client/home/Post.vue'
import { ref } from 'vue'

const posts = ref([
  {
    id: 1,
    username: 'user1',
    userImg: '',
    image: '/api/placeholder/600/600',
    likes: 234,
    caption: 'Beautiful sunset today! 🌅 #sunset #vibes',
    comments: [
      { username: 'user2', text: 'Amazing photo!' },
      { username: 'user3', text: 'Great shot 👏' },
      { username: 'user4', text: 'Love the colors!' }
    ],
    time: '2 HOURS AGO'
  },
  {
    id: 2,
    username: 'user5',
    userImg: '',
    image: '/api/placeholder/600/600',
    likes: 457,
    caption: 'Just another day in paradise 🏝️ #beach #summer',
    comments: [
      { username: 'user6', text: 'Wish I was there!' },
      { username: 'user7', text: 'Looks so relaxing' },
      { username: 'user8', text: 'Perfect vacation spot!' }
    ],
    time: '5 HOURS AGO'
  }
])
</script>


<style scoped>
.main-content {
  flex: 1;
  margin-left: 530px;
  padding: 20px;
  max-width: 800px;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>