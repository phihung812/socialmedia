<template>
  <div class="instagram-clone">
    <Sidebar />
    <MainContent :posts="posts" />
    <SuggestionSection :suggestions="suggestions" />
  </div>
</template>

<script>
import Sidebar from '../components/client/Sidebar.vue'
import MainContent from '../components/client/MainContent.vue'
import SuggestionSection from '../components/client/SuggestionSection.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    MainContent,
    SuggestionSection
  },
  data() {
    return {
      posts: [
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
      ],
      suggestions: [
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
      ]
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

body {
  background-color: #fafafa;
}

.instagram-clone {
  display: flex;
  min-height: 100vh;
}

/* Media Queries */
@media (max-width: 1260px) {
  .suggestions {
    display: none;
  }
  
  .main-content {
    margin: 0 auto;
    padding-left: 260px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
    padding: 25px 0;
  }
  
  .logo h1 {
    display: none;
  }
  
  .menu-item span {
    display: none;
  }
  
  .menu-item {
    justify-content: center;
  }
  
  .menu-item i {
    margin-right: 0;
  }
  
  .message-count {
    position: absolute;
    top: 8px;
    right: 10px;
  }
  
  .main-content {
    margin-left: 60px;
    padding-left: 20px;
  }
}
</style>