<template>
    <div class="account-settings">
        <div class="account-settings-container">
            <Sidebar/>
            <Content />
        </div>
    </div>
</template>

<script setup>
  import Sidebar from './Sidebar.vue';
  import Content from './Content.vue';
</script>

<style setup>
.account-settings {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #262626;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 40px); /* Trừ đi padding trên và dưới */
  width: 70%;
  padding-left: 20px;
}


.account-settings-container {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 105%; /* Chiếm toàn bộ chiều cao khả dụng */
  
}
</style>