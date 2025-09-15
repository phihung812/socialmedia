<template>
  <div class="suggestions">
    <div class="suggestions-header">
      <div class="suggestions-user">
        <div class="suggestions-user-img">
          <img src="" alt="Your Profile" />
        </div>
        <div class="suggestions-user-info">
          <p class="username">yourusername</p>
          <p class="name">Your Name</p>
        </div>
      </div>
      <p class="switch">Switch</p>
    </div>
    <div class="suggestions-title">
      <p>Suggestions For You</p>
      <p>See All</p>
    </div>
    <div class="suggestion-list">
      <div class="suggestion" v-for="suggestion in suggestions" :key="suggestion.id">
        <div class="suggestion-user">
          <div class="suggestion-user-img">
            <img :src="suggestion.userImg" alt="Suggestion" />
          </div>
          <div class="suggestion-user-info">
            <p class="username">{{ suggestion.username }}</p>
            <p class="relation">{{ suggestion.relation }}</p>
          </div>
        </div>
        <p class="follow">Follow</p>
      </div>
    </div>
    <div class="footer">
      <p>
        About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language
      </p>
      <p class="copyright">© 2025 INSTAGRAM CLONE</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';


const suggestions = ref([
  {
    id: 1,
    username: 'user9',
    userImg: '',
    relation: 'Followed by user1 + 5 more'
  },
  {
    id: 2,
    username: 'user10',
    userImg: '',
    relation: 'New to Instagram'
  },
  {
    id: 3,
    username: 'user11',
    userImg: '',
    relation: 'Followed by user3 + 2 more'
  },
  {
    id: 4,
    username: 'user12',
    userImg: '',
    relation: 'Follows you'
  }
])
</script>


<style scoped>
.suggestions {
  width: 300px;
  margin-left: 20px;
  margin-right: 70px;
  padding: 20px 0;
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.suggestions-user {
  display: flex;
  align-items: center;
}

.suggestions-user-img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.suggestions-user-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.suggestions-user-info .username {
  font-weight: 500;
}

.suggestions-user-info .name {
  color: #8e8e8e;
}

.switch {
  color: #0095f6;
  font-weight: 500;
  cursor: pointer;
}

.suggestions-title {
  display: flex;
  justify-content: space-between;
  color: #8e8e8e;
  font-weight: 500;
  margin-bottom: 15px;
}

.suggestions-title p:last-child {
  color: #262626;
  cursor: pointer;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.suggestion {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-user {
  display: flex;
  align-items: center;
}

.suggestion-user-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}

.suggestion-user-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.suggestion-user-info .username {
  font-weight: 500;
  font-size: 14px;
}

.suggestion-user-info .relation {
  color: #8e8e8e;
  font-size: 12px;
}

.follow {
  color: #0095f6;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
}

.footer {
  margin-top: 20px;
  color: #c7c7c7;
  font-size: 11px;
  line-height: 1.5;
}

.copyright {
  margin-top: 16px;
  text-transform: uppercase;
}
</style>