<template>
    <div class="messages-container">
        <div class="main-content">
            <Sidebar :lastSentMessage="lastSentMessage" 
               />
            <router-view v-slot="{ Component }">
                <component :is="Component" @sendMessage="handleSendMessage" />
            </router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/client/message/Sidebar.vue'
import { ref } from 'vue';

const lastSentMessage = ref(null)

function handleSendMessage(payload) {
    lastSentMessage.value = payload    
}



</script>

<style scoped>
.messages-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #fff;
    margin-left: 270px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.messages-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #dbdbdb;
    background: #fff;
    z-index: 10;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.back-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    color: #262626;
}

.header-left h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #262626;
}

.header-actions {
    display: flex;
    gap: 16px;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #262626;
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.action-btn:hover {
    background: #f5f5f5;
}

.main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
}



/* Responsive */
@media (max-width: 768px) {
    .main-content {
        position: relative;
    }

    .back-btn {
        display: block !important;
    }

    .empty-state {
        display: none;
    }
}
</style>