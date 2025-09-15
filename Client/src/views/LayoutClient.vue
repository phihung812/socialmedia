<template>
  <div class="instagram-clone">
    <Sidebar2 />
    <router-view></router-view>
  </div>
</template>

<script setup>
import Sidebar from '@/components/client/home/Sidebar.vue'
import Sidebar2 from '@/components/client/home/Sidebar2.vue';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
onMounted( async() => {
    await userStore.fetchUser() 
})

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
  background-color: rgb(255, 253, 251);
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