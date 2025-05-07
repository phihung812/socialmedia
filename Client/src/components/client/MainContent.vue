<template>
  <div class="main-content">
    <StorySection />
    <div class="posts">
      <Post v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script>
import StorySection from './StorySection.vue'
import Post from './Post.vue'

export default {
  name: 'MainContent',
  components: {
    StorySection,
    Post
  },
  props: {
    posts: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.main-content {
  flex: 1;
  margin-left: 380px;
  padding: 20px;
  max-width: 800px;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>