<template>
    <div class="sidebar">
        <div class="sidebar-header">
            <h2>Messages</h2>
            <button class="new-message-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </button>
        </div>

        <div class="conversations-list">
            <div v-for="conversation in conversations" :key="conversation._id" class="conversation-item">
                <div class="avatar" @click="navigateToMessage(conversation.displayUsername)">
                    <img :src="conversation.displayAvatar" alt="Avt" />
                    <!-- <div v-if="conversation.isOnline" class="online-indicator"></div> -->
                </div>
                <div class="conversation-info" @click="navigateToMessage(conversation.displayUsername)">
                    <div class="conversation-header">
                        <span class="username">{{ conversation.displayName }}</span>
                        <span class="time">{{ formatTime(conversation.lastMessageId?.createdAt) }}</span>
                    </div>
                    <div class="last-message">
                        <span :class="{ unread: !conversation.isRead }">{{ conversation.lastMessageId.senderId === currentUserId ? 'Bạn: '
                            + conversation.lastMessageContent : conversation.lastMessageContent }}</span>
                        <div v-if="!conversation.isRead" class="unread-dot"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getConversation } from '@/service/message.service';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'vue-router';
import { useSocketStore } from '@/stores/socketStore';
import { useAuthStore } from '@/stores/authStore';
import emitter from '@/utils/eventBus';

dayjs.extend(utc);
dayjs.extend(timezone);
const socketStore = useSocketStore()
const authStore = useAuthStore();

const router = useRouter()
const conversations = ref()
const currentUserId = ref()


onMounted(async () => {
    currentUserId.value = authStore.user?._id;
    await loadConversations();

    emitter.on('reload-conversations', async () => {        
        await loadConversations();
    });

    socketStore.messageSocket?.on('sidebar-message-update', async (message) => {        
        
        const fondCon = conversations.value.find(c => c._id === message.conversationId)        
        if (fondCon) {
            fondCon.lastMessageId.senderId = message.senderId;
            fondCon.lastMessageContent = message.content;
            fondCon.isRead = false;
        } else {
            const newConversation = {
                _id: message.conversationId,
                displayName: message.sender.senderFullName || '',
                displayUsername: message.sender.senderUsername || '',
                displayAvatar: message.sender.senderAvatar || '',
                lastMessageId: {
                    senderId: message.senderId,
                    createdAt: message.createdAt,
                },
                lastMessageContent: message.content,
                isRead: false,
            };
            conversations.value.push(newConversation);
        }
    })  

})

const loadConversations = async () => {
    conversations.value = await getConversation();
};

const props = defineProps<{
    lastSentMessage: any,
}>()

watch(
    () => props.lastSentMessage,
    (newSendMessage) => {
        if (newSendMessage) {                        
            const fondCon = conversations.value.find(c => c._id === newSendMessage.conversationId)
            if(fondCon){
                fondCon.lastMessageId.senderId = newSendMessage.senderId;
                fondCon.lastMessageContent = newSendMessage.lastMessageContent;
                fondCon.isRead = true;
            } else {
                
                const newConversation = {
                    _id: newSendMessage.conversationId,
                    displayName: newSendMessage.displayName || '',
                    displayUsername: newSendMessage.dispayUsername || '',
                    displayAvatar: newSendMessage.displayAvatar || '',
                    lastMessageId: {
                        senderId: newSendMessage.senderId,
                        createdAt: newSendMessage.createdAt,
                    },
                    lastMessageContent: newSendMessage.lastMessageContent,
                    isRead: true,
                };
                conversations.value.push(newConversation);                
            }
            
            
        }
    }
)



const navigateToMessage = async (username: string) => {
    router.push({ path: `/message/${username}` });
    const conversation = conversations.value.find(c => c.displayUsername === username);
    if (conversation) {
        conversation.isRead = true;
    }

};

const formatTime = (date: Date | string): string => {
    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const msgDate = dayjs(date).tz('Asia/Ho_Chi_Minh');
    const diff = now.valueOf() - msgDate.valueOf();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
}

onUnmounted(() => {
    socketStore.messageSocket?.off('message-send-completed');
    emitter.off('reload-conversations');
});
</script>

<style scoped>
.sidebar {
    width: 349px;
    border-right: 1px solid #dbdbdb;
    display: flex;
    flex-direction: column;
    background: #fff;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #dbdbdb;
}

.sidebar-header h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #262626;
}

.new-message-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #262626;
    padding: 8px;
}

.conversations-list {
    flex: 1;
    overflow-y: auto;
}

.conversation-item {
    display: flex;
    align-items: center;
    padding: 8px 20px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.conversation-item:hover {
    background: #f5f5f5;
}

.conversation-item.active {
    background: #f5f5f5;
}

.avatar {
    position: relative;
    margin-right: 12px;
}

.avatar img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
}

.online-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 14px;
    height: 14px;
    background: #42b883;
    border: 2px solid #fff;
    border-radius: 50%;
}

.conversation-info {
    flex: 1;
    min-width: 0;
}

.conversation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.username {
    font-weight: 600;
    color: #262626;
    font-size: 14px;
}

.time {
    color: #8e8e8e;
    font-size: 12px;
}

.last-message {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.last-message span {
    color: #8e8e8e;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
}

.last-message span.unread {
    color: #262626;
    font-weight: 600;
}

.unread-dot {
    width: 8px;
    height: 8px;
    background: #0095f6;
    border-radius: 50%;
    margin-left: 8px;
}

/* Responsive */
@media (max-width: 768px) {
    .sidebar {
        width: 100%;
        position: absolute;
        left: 0;
        z-index: 5;
        transform: translateX(0);
        transition: transform 0.3s ease;
    }
}
</style>