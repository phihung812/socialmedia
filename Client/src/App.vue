<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useAuthStore } from './stores/authStore';
import { io, Socket } from 'socket.io-client';
import { useSocketStore } from './stores/socketStore';
import { useNotificationStore } from './stores/notificationStore';


const socket = ref<Socket | null>(null);

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const socketStore = useSocketStore();

onMounted(() => {
  authStore.loadFromLocalStorage();
});

watch(() => authStore.accessToken, (token) => {
  if (token && authStore.user?._id) {
    socketStore.connect(token, authStore.user._id);

    socketStore.notificationSocket?.on('notification-new', (data) => {                  
      notificationStore.addNotification(data.receiverId, data);
      alert(data.content);
    });
  } else {
    socketStore.disconnect();
  }
});

onUnmounted(() => {
  socket.value?.disconnect();
  socket.value = null;
});
</script>


<template>
  <router-view />
</template>
<style scoped></style>
