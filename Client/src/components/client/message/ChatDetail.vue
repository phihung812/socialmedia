<template>
    <div class="chat-area">
        <div class="chat-header">
            <div class="chat-user-info">
                <div class="avatar">
                    <img :src="receiver?.user.avatar.avatar_url " alt="AVT" />
                    <!-- <div v-if="conversation.isOnline" class="online-indicator"></div> -->
                </div>
                <div class="user-details">
                    <h3>{{ receiver?.user.username }}</h3>
                    <!-- <span class="status">{{ conversation.isOnline ? 'Active now' : 'Last seen recently' }}</span> -->
                </div>
            </div>
            <div class="chat-actions" ref="dropdownRef">
                <button class="action-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                </button>
                <button class="action-btn" @click="toggleMoreOptions">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                    </svg>
                </button>

                <div v-if="showMoreOptions" class="more-options-dropdown" @click.stop>
                    <button class="dropdown-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2" />
                        </svg>
                        Chặn
                    </button>

                    <button class="dropdown-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="currentColor"
                                stroke-width="2" fill="none" />
                            <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2" />
                        </svg>
                        Báo cáo
                    </button>


                    <button class="dropdown-item danger" @click="deleteConver(conversationId)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" />
                            <path d="M19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"
                                stroke="currentColor" stroke-width="2" />
                            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2" />
                            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2" />
                        </svg>
                        Xóa tin nhắn
                    </button>

                </div>
            </div>
        </div>

        <div class="messages-area" ref="messagesArea">
            <div v-for="message in messages" :key="message._id" class="message"
                :class="{ 'own-message': message.senderId === currentUserId }">
                <div v-if="message.senderId !== currentUserId" class="message-avatar">
                    <img :src="message.sender.senderAvatar" alt="avt" />
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <p>{{ message.content }}</p>
                    </div>
                    <span class="message-time">{{ formatMessageTime(new Date(message.createdAt)) }}</span>
                </div>
            </div>
        </div>

        <div class="message-input-area">
            <div class="input-container">
                <button class="attachment-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="3" height="3" x="9" y="9" rx="1" />
                        <rect width="3" height="3" x="12" y="12" rx="1" />
                        <rect width="3" height="3" x="15" y="15" rx="1" />
                        <rect width="3" height="3" x="6" y="12" rx="1" />
                        <rect width="3" height="3" x="12" y="6" rx="1" />
                        <rect width="3" height="3" x="12" y="18" rx="1" />
                    </svg>
                </button>
                <input v-model="newMessage" type="text" placeholder="Message..." @keyup.enter="sendMessage"
                    class="message-input" />
                <button class="emoji-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 9 1.5 1.5L12 9l1.5 1.5L15 9" />
                        <path d="M8 15s1.5 2 4 2 4-2 4-2" />
                    </svg>
                </button>
                <button v-if="newMessage.trim()" @click="sendMessage" class="send-btn">
                    Send
                </button>
                <button v-else class="like-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { getUserProfile } from '@/service/user.service';
import { useRoute, useRouter } from 'vue-router';
import { useSocketStore } from '@/stores/socketStore';
import { detailMessage, deleteConversation } from '@/service/message.service';
import { useAuthStore } from '@/stores/authStore';
import { readMessage } from '@/service/message.service';
import emitter from '@/utils/eventBus';


export interface Message {
    _id: string;
    content: string;
    senderId: string;
    conversationId: string;
    createdAt: string;
    sender: {
        senderUsername: string;
        senderFullName: string;
        senderAvatar: string;
    };
    readBy: string[];
}

export interface SimplifiedUserProfile {
    user: {
        _id: string;
        username: string;
        fullName: string;
        avatar: {
            avatar_url: string;
        };
    };
}

const route = useRoute()
const router = useRouter()
const socketStore = useSocketStore()
const authStore = useAuthStore();

const receiver = ref<SimplifiedUserProfile | null>(null);
const messages = ref<Message[]>([])
const receiverId = ref<string | null>(null);
const currentUserId = ref<string>('');
const conversationId = ref('');

const showMoreOptions = ref(false)
const dropdownRef = ref<HTMLElement | null>(null);

const emit = defineEmits(['sendMessage'])


watch(receiverId, (newReceiverId, oldReceiverId) => {
    if (newReceiverId && newReceiverId !== oldReceiverId) {
        socketStore.messageSocket?.off('message-see');

        socketStore.messageSocket?.on('message-see', async (message) => {
            // Chỉ xử lý tin nhắn từ người đang chat
            if (message.senderId === newReceiverId) {
                messages.value.push(message);
                await readMessage(newReceiverId);

                nextTick(() => {
                    scrollToBottom();
                });
            }
        });
    }
});

onMounted(async () => {
    authStore.loadFromLocalStorage();
    currentUserId.value = authStore.user?._id || '';

    const username = route.params.username as string;
    receiver.value = await getUserProfile(username);
    receiverId.value = receiver.value?.user._id ?? null;

    if (receiverId.value) {
        const fetchedMessages = await detailMessage(receiverId.value);
        messages.value = fetchedMessages.reverse();

        if (messages.value.length > 0) {
            conversationId.value = messages.value[0].conversationId;

            await readMessage(receiverId.value);
            nextTick(() => scrollToBottom());
        }
    }
});


const loadChatData = async () => {
    const username = route.params.username as string;

    receiver.value = await getUserProfile(username);
    receiverId.value = receiver.value?.user._id ?? null;

    if (receiverId.value) {
        const fetchedMessages = await detailMessage(receiverId.value);
        messages.value = fetchedMessages.reverse();

        if (messages.value.length > 0) {
            conversationId.value = messages.value[0].conversationId;

            await readMessage(receiverId.value);
            nextTick(() => scrollToBottom());
        }
    }
};

watch(() => route.params.username, async () => {
    await loadChatData();
});


const newMessage = ref('')
const messagesArea = ref<HTMLElement>()

const sendMessage = async () => {
    if (!newMessage.value.trim() || !receiverId.value || !currentUserId.value) return;
    const messageData = {
        content: newMessage.value,
        receiverId: receiverId.value,
    }
    socketStore.messageSocket?.emit('send_message', messageData)

    socketStore.messageSocket?.on('message-send-completed', async (message) => {        
        conversationId.value = message.conversationId
        emit('sendMessage', {
            senderId: currentUserId.value,
            lastMessageContent: message.content,
            conversationId: conversationId.value || tempMessage.conversationId,
            createdAt: tempMessage.createdAt,
            displayName: receiver.value?.user.fullName || '',
            dispayUsername: receiver.value?.user.username || '',
            displayAvatar: receiver.value?.user.avatar?.avatar_url || '',
        })
    })

    const tempMessage: Message = {
        _id: 'temp-' + Date.now(),
        content: newMessage.value,
        senderId: currentUserId.value,
        conversationId: conversationId.value,
        createdAt: new Date().toISOString(),
        sender: {
            senderUsername: authStore.user?.username || '',
            senderFullName: authStore.user?.fullName || '',
            senderAvatar: authStore.user?.avatar?.avatar_url || '',
        },
        readBy: [currentUserId.value],
    };    

    messages.value.push(tempMessage);

    newMessage.value = ''

    nextTick(() => {
        scrollToBottom()
    })
}

const scrollToBottom = () => {
    if (messagesArea.value) {
        messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
}

const formatMessageTime = (date: Date): string => {
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}

const toggleMoreOptions = () => {
    showMoreOptions.value = !showMoreOptions.value
}
const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        showMoreOptions.value = false;
    }
};

const deleteConver = async (conversationId: string)=>{    
    await deleteConversation(conversationId)
    alert('Đã xóa cuộc trò chuyện')
    emitter.emit('reload-conversations');
    router.push('/message')

}  

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    socketStore.messageSocket?.off('message-see');
    document.removeEventListener('click', handleClickOutside);

});


</script>

<style scoped>
.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 1060px;
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #dbdbdb;
    background: #fff;
}

.chat-user-info {
    display: flex;
    align-items: center;
}

.chat-user-info .avatar {
    margin-right: 12px;
    position: relative;
}

.chat-user-info .avatar img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.online-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background: #42b883;
    border: 2px solid #fff;
    border-radius: 50%;
}

.user-details h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 2px 0;
    color: #262626;
}

.status {
    font-size: 12px;
    color: #8e8e8e;
}

.chat-actions {
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

.messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.message {
    display: flex;
    align-items: flex-end;
    gap: 8px;
}

.message.own-message {
    flex-direction: row-reverse;
}

.message-avatar img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
}

.message-content {
    display: flex;
    flex-direction: column;
    max-width: 236px;
}

.own-message .message-content {
    align-items: flex-end;
}

.message-bubble {
    padding: 16px;
    border-radius: 22px;
    background: #efefef;
    word-wrap: break-word;
}

.own-message .message-bubble {
    background: #3797f0;
    color: #fff;
}

.message-bubble p {
    margin: 0;
    font-size: 14px;
    line-height: 18px;
}

.message-time {
    font-size: 11px;
    color: #8e8e8e;
    margin-top: 8px;
    padding: 0 12px;
}

.message-input-area {
    padding: 20px;
    border-top: 1px solid #dbdbdb;
    background: #fff;
}

.input-container {
    display: flex;
    align-items: center;
    border: 1px solid #dbdbdb;
    border-radius: 22px;
    padding: 8px 12px;
    gap: 12px;
}

.attachment-btn,
.emoji-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #262626;
    padding: 8px;
}

.message-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    line-height: 18px;
    resize: none;
    background: transparent;
}

.send-btn {
    background: none;
    border: none;
    color: #0095f6;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
}

.like-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #262626;
    padding: 8px;
}

.more-options-dropdown {
    position: absolute;
    top: 8%;
    right: 0;
    background: white;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 100;
    min-width: 180px;
    overflow: hidden;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #0f1419;
    transition: background-color 0.2s;
    text-align: left;
}

.dropdown-item:hover {
    background-color: #f7f7f7;
}

.dropdown-item.danger {
    color: #ff3040;
}

.dropdown-item.danger:hover {
    background-color: #ffeef0;
}

/* Responsive */
@media (max-width: 768px) {
    .chat-area {
        width: 100%;
        position: absolute;
        left: 0;
        z-index: 10;
        background: #fff;
    }
}
</style>