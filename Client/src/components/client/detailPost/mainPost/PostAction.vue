<template>
    <div class="post-actions">
        <button class="action-btn" :class="{ active: post.liked }" @click="toggleLike">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    :fill="post.liked ? '#ff3040' : 'none'" :stroke="post.liked ? '#ff3040' : 'currentColor'"
                    stroke-width="2" />
            </svg>
            <span>{{ post.statistics.likeCount }}</span>
        </button>

        <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor"
                    stroke-width="2" fill="none" />
            </svg>
            <span>{{ post.statistics.commentCount }}</span>
        </button>

        <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor"
                    stroke-width="2" fill="none" />
            </svg>
        </button>

        <div class="more-options-wrapper">
            <button class="action-btn" @click="toggleMoreOptions">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="19" cy="12" r="1" fill="currentColor" />
                    <circle cx="5" cy="12" r="1" fill="currentColor" />
                </svg>
            </button>

            <!-- More Options Dropdown -->
            <div v-if="showMoreOptions" class="more-options-dropdown" @click.stop>
                <button class="dropdown-item" @click="copyLink">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor"
                            stroke-width="2" fill="none" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor"
                            stroke-width="2" fill="none" />
                    </svg>
                    Sao chép liên kết
                </button>

                <button v-if="post.userId !== userId && !post.saved" class="dropdown-item" @click="savePost">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor"
                            stroke-width="2" fill="none" />
                    </svg>
                    Lưu
                </button>
                <button v-else-if="post.saved" class="dropdown-item" @click="unSavePost">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor"
                            stroke-width="2" fill="none" />
                    </svg>
                    Bỏ lưu
                </button>
                <button v-else-if="post.userId === userId" class="dropdown-item" @click="">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    Chỉnh sửa bài viết
                </button>

                <button v-if="post.userId !== userId" class="dropdown-item danger" @click="reportPost">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                            stroke="currentColor" stroke-width="2" fill="none" />
                        <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" />
                        <dot cx="12" cy="17" r="1" fill="currentColor" />
                    </svg>
                    Báo cáo bài viết
                </button>
                <button v-else-if="post.userId === userId" class="dropdown-item danger"
                    @click="confirmDeletePost">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                        <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" />
                        <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" />
                    </svg>
                    Xóa bài viết
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { likePost, unlikePost } from '@/service/like.service'
import { usePostStore } from '@/stores/postStore';
import { Post } from '@/views/Search.vue'
import { useRouter } from 'vue-router';
import { deletePost } from '@/service/post.service'
import { ref } from 'vue';
import { savedPost, unSavedPost } from '@/service/post.service';


const props = defineProps<{
    post: Post;
    userId: string;
}>()
const postStore = usePostStore()
const router = useRouter()


const post = props.post;
const showMoreOptions = ref(false)


const toggleLike = async () => {

    const isLiked = !post.liked;

    try {
        if (isLiked) {
            await likePost(post._id);
        } else {
            await unlikePost(post._id);
        }

        const updatedLikeCount = post.statistics.likeCount + (isLiked ? 1 : -1);

        post.liked = isLiked;
        post.statistics.likeCount = updatedLikeCount;

        postStore.updatePostMapField(post._id, {
            liked: isLiked,
            statistics: {
                ...post.statistics,
                likeCount: updatedLikeCount,
            },
        });
    } catch (error) {
        console.error('Lỗi khi like/unlike:', error);
    }
};

const confirmDeletePost = async () => {
    if (post && confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
        postStore.deletePostById(post._id);
        const result = await deletePost(post._id)
        alert(result.message)
        router.push('/profile')
    }
}

const reportPost = () => {
    alert('Đã báo cáo bài viết!')
    showMoreOptions.value = false
}

const toggleMoreOptions = () => {
    showMoreOptions.value = !showMoreOptions.value
}

const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Đã sao chép liên kết!')
    showMoreOptions.value = false
}

const savePost = async () => {
    await savedPost(post)
    post.saved = true;
    alert('Đã lưu bài viết!')
    showMoreOptions.value = false
}

const unSavePost = async () => {
    await unSavedPost(post)
    post.saved = false;
    alert('Đã bỏ lưu bài viết!')
    showMoreOptions.value = false
}
</script>

<style scoped>
.post-actions {
    display: flex;
    align-items: center;
    gap: 25px;
    margin-left: 60px;
    padding-top: 8px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 17px;
    color: #657786;
    transition: all 0.2s;
}

.action-btn:hover {
    background-color: #f7f7f7;
}

.action-btn.active {
    color: #ff3040;
}

.more-options-wrapper {
    position: relative;
}

.more-options-dropdown {
    position: absolute;
    top: 100%;
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
</style>