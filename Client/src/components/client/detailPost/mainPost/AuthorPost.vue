<template>
    <div class="post-author">
        <img :src="post.author?.avatar || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'"
            :alt="post.author.username" class="avatar">
        <div class="author-info" @click="navigateToResultUser(post)">
            <h3 class="author-name">{{ post.author.fullName }}</h3>
            <span class="author-username">@{{ post.author.username }}</span>
            <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
        <button v-if="post.userId !== currentUserId" class="follow-btn" @click="toggleFollow">{{ post.followed ?
            'Hủy theo dõi' : 'Theo dõi' }}</button>

    </div>
</template>

<script setup lang="ts">
import { Post } from '@/views/Search.vue'
import { follow, unfollow } from '@/service/follow.service'
import { useRouter } from 'vue-router';


const router = useRouter()
const props = defineProps<{
    post: Post;
    currentUserId: string;
}>()
const post = props.post
const currentUserId = props.currentUserId


const formatTime = (date) => {
    date = new Date(date)
    const now = new Date()
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes}p`
    if (hours < 24) return `${hours}h`
    return `${days}d`
}

const toggleFollow = async () => {
    try {
        if (post.followed) {
            await unfollow(post.author.userId)
            post.followed = false;
        } else {
            await follow(post.author.userId);
            post.followed = true;
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái follow:', error);
    }
}

const navigateToResultUser = (result: any) => {
    if (result.userId === currentUserId) {
        router.push({ path: `/profile` });
    } else {
        router.push({ path: `/${result.author.username}` });
    }

};




</script>

<style scoped>
.post-author {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
}

.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 20px;
    margin-left: 10px;
}

.avatar.small {
    width: 32px;
    height: 32px;
}

.author-info {
    flex: 1;
    cursor: pointer;
}

.author-name {
    font-size: 20px;
    font-weight: 600;
    margin: 8px 0 4px 0;
    color: #0f1419;
}

.author-username {
    color: #657786;
    font-size: 16px;
    margin-right: 8px;
}

.post-time {
    color: #657786;
    font-size: 16px;
}

.follow-btn {
    background: #0f1419;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 400;
    margin-top: 15px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.follow-btn:hover {
    background: #272c30;
}
</style>