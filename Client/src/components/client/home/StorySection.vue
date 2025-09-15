<template>
  <div class="stories">
    <div class="story" v-for="(story, index) in stories" :key="index">
      <div class="story-img">
        <img :src="story.img" alt="Story" />
      </div>
      <p>{{ story.username }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StorySection',
  data() {
    return {
      stories: [
        { username: 'user1', img: '/api/placeholder/60/60' },
        { username: 'user2', img: '/api/placeholder/60/60' },
        { username: 'user3', img: '/api/placeholder/60/60' },
        { username: 'user4', img: '/api/placeholder/60/60' },
        { username: 'user5', img: '/api/placeholder/60/60' }
      ]
    }
  }
}
</script>

<style scoped>
.stories {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  overflow-x: auto;
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 24px;
}

.stories::-webkit-scrollbar {
  display: none;
}

.story {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.story-img {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  margin-bottom: 5px;
}

.story-img img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
}

.story p {
  font-size: 12px;
}
</style>