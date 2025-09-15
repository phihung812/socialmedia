<template>

    <!-- Comment Input -->
    <div class="comment-input-section">
        <img :src="currentUser.avatar?.avatar_url || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'"
            :alt="currentUser.fullName" class="avatar">
        <div class="comment-input-wrapper">
            <textarea v-model="newComment" placeholder="Viết bình luận..." class="comment-input"
                @keydown.enter.prevent="submitComment"></textarea>
            <button class="submit-comment-btn" :disabled="!newComment.trim()" @click="submitComment">
                Đăng
            </button>
        </div>
    </div>

    <!-- Comments Section -->
    <div class="comments-section">
        <h3 class="comments-title">Bình luận</h3>

        <div v-if="!comments" class="no-comments">
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        </div>

        <div v-else class="comments-list">
            <div v-for="comment in comments" :key="comment._id" class="comment-thread">
                <!-- Main Comment -->
                <div class="comment-item">
                    <img :src="comment.author?.avatar.avatar_url || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'"
                        :alt="comment.author?.fullName" class="avatar">
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author" @click.stop="navigateToResultUser(comment.author.username)">{{
                                comment.author?.fullName }}</span>
                            <span class="comment-username">@{{ comment.author?.username }}</span>
                            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>

                            <!-- Menu 3 chấm -->
                            <div class="comment-menu" @click.stop>
                                <button class="menu-trigger" @click="toggleMenu(comment._id)">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="5" r="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <circle cx="12" cy="19" r="2" />
                                    </svg>
                                </button>

                                <div v-if="showMenu === comment._id" class="menu-dropdown">
                                    <button class="menu-item" @click="editComment(comment._id)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Sửa
                                    </button>
                                    <button class="menu-item delete" @click="deleteComment(comment._id)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <polyline points="3,6 5,6 21,6" />
                                            <path
                                                d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2" />
                                        </svg>
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p class="comment-text">{{ comment.content }}</p>

                        <div class="comment-actions">
                            <button class="comment-action-btn" :class="{ active: comment.liked }"
                                @click="toggleCommentLike(comment._id)">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                        :fill="comment.liked ? '#ff3040' : 'none'"
                                        :stroke="comment.liked ? '#ff3040' : 'currentColor'" stroke-width="2" />
                                </svg>
                                <span>{{ comment.likeCount }}</span>
                            </button>

                            <button class="comment-action-btn" @click="toggleReplyInput(comment._id)">
                                Trả lời
                            </button>

                            <!-- Nút xem câu trả lời -->
                            <button v-if="comment.replyCount > 0" class="comment-action-btn view-replies-btn"
                                @click="toggleRepliesVisibility(comment._id)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M7 17L17 7" />
                                    <path d="M7 7h10v10" />
                                </svg>
                                {{ showReplies === comment._id ? 'Ẩn' : 'Xem' }} {{ comment.replyCount }} câu trả lời
                            </button>
                        </div>

                        <!-- Reply Input -->
                        <div v-if="showReplyInput === comment._id" class="reply-input-section">
                            <img :src="currentUser.avatar?.avatar_url || 'https://png.pngtree.com/thumb_back/fw800/background/20220707/pngtree-3d-cartoon-avatar-of-bearded-man-avatar-people-design-photo-image_47493210.jpg'"
                                :alt="currentUser.fullName" class="avatar small">
                            <div class="reply-input-wrapper">
                                <textarea v-model="replyText" :placeholder="`Trả lời @${comment.author.username}...`"
                                    class="reply-input" @keydown.enter.prevent="submitReply(comment._id)"></textarea>
                                <div class="reply-actions">
                                    <button class="cancel-reply-btn" @click="cancelReply">Hủy</button>
                                    <button class="submit-reply-btn" :disabled="!replyText.trim()"
                                        @click="submitReply(comment._id)">
                                        Trả lời
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Replies -->
                <div v-if="showReplies === comment._id && comment.replyCount > 0" class="replies-list">
                    <div v-for="reply in repliesComment[comment._id]" :key="reply._id" class="reply-item">
                        <img :src="reply.author.avatar.avatar_url" :alt="reply.author.fullName" class="avatar">
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-author"
                                    @click.stop="navigateToResultUser(reply.author.username)">{{
                                        reply.author.fullName }}</span>
                                <span class="comment-username">@{{ reply.author.username }}</span>
                                <span class="comment-time">{{ formatTime(reply.createdAt) }}</span>

                                <!-- Menu 3 chấm cho reply -->
                                <div class="comment-menu">
                                    <button class="menu-trigger" @click.stop="toggleMenu(reply._id)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="5" r="2" />
                                            <circle cx="12" cy="12" r="2" />
                                            <circle cx="12" cy="19" r="2" />
                                        </svg>
                                    </button>

                                    <div v-if="showMenu === reply._id" class="menu-dropdown">
                                        <button class="menu-item" @click.stop="editReply(comment._id, reply._id)">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Sửa
                                        </button>
                                        <button class="menu-item delete"
                                            @click.stop="deleteReply(comment._id, reply._id)">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <polyline points="3,6 5,6 21,6" />
                                                <path
                                                    d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2,2h4a2,2 0 0,1,2,2v2" />
                                            </svg>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p class="comment-text">{{ reply.content }}</p>

                            <div class="comment-actions">
                                <button class="comment-action-btn" :class="{ active: reply.liked }"
                                    @click.stop="toggleReplyLike(comment._id, reply._id)">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                            :fill="reply.liked ? '#ff3040' : 'none'"
                                            :stroke="reply.liked ? '#ff3040' : 'currentColor'" stroke-width="2" />
                                    </svg>
                                    <span>{{ reply.likeCount }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="myNewReplies[comment._id]?.length" class="replies-list">
                    <div v-for="reply in myNewReplies[comment._id]" :key="reply._id" class="reply-item">
                        <img :src="reply.author.avatar.avatar_url" :alt="reply.author.fullName" class="avatar">
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-author">{{ reply.author.fullName }}</span>
                                <span class="comment-username">@{{ reply.author.username }}</span>
                                <span class="comment-time">{{ formatTime(reply.createdAt) }}</span>

                                <!-- Menu 3 chấm cho reply -->
                                <div class="comment-menu" @click.stop>
                                    <button class="menu-trigger" @click="toggleMenu(reply._id)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="5" r="2" />
                                            <circle cx="12" cy="12" r="2" />
                                            <circle cx="12" cy="19" r="2" />
                                        </svg>
                                    </button>

                                    <div v-if="showMenu === reply._id" class="menu-dropdown">
                                        <button class="menu-item" @click="editReply(comment._id, reply._id)">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Sửa
                                        </button>
                                        <button class="menu-item delete" @click="deleteReply(comment._id, reply._id)">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <polyline points="3,6 5,6 21,6" />
                                                <path
                                                    d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2,2h4a2,2 0 0,1,2,2v2" />
                                            </svg>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p class="comment-text">{{ reply.content }}</p>

                            <div class="comment-actions">
                                <button class="comment-action-btn" :class="{ active: reply.liked }"
                                    @click="toggleReplyLike(comment._id, reply._id)">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                            :fill="reply.liked ? '#ff3040' : 'none'"
                                            :stroke="reply.liked ? '#ff3040' : 'currentColor'" stroke-width="2" />
                                    </svg>
                                    <span>{{ reply.likeCount }}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div ref="loadMoreTrigger" v-if="hasMore && !loading" class="loading-trigger">Tải thêm...</div>
            <div v-if="loading" class="loading">Đang tải...</div>


        </div>
    </div>
</template>

<script setup lang="ts">
import { User } from '@/stores/userStore';
import { onBeforeUnmount, onMounted, onUnmounted, reactive, ref } from 'vue';
import { Post } from '@/views/Search.vue'
import { useRoute, useRouter } from 'vue-router';
import { getCommentToPost, createComment, getRepliesCommentByParent, deleteCommentById } from '@/service/comment.service'
import { usePostStore } from '@/stores/postStore';
import { Comment } from '@/stores/commentStore';
import { watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';

const props = defineProps<{
    currentUser: User;
    post: Post;
}>()

const route = useRoute()
const newComment = ref('')
const post = props.post;
const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
const postStore = usePostStore()
const showReplyInput = ref(null)
const replyText = ref('')
const myNewReplies = reactive<Record<string, Comment[]>>({});
const showReplies = ref(null)
const repliesComment = ref<Record<string, Comment[]>>({})
const showMenu = ref(null)
const loadMoreTrigger = ref(null);
const router = useRouter();
const authStore = useAuthStore();
const currentPage = ref(0) 
const limit = 10
const hasMore = ref(true)
const loading = ref(false)
const comments = ref()
let observer;

const socketStore = useSocketStore();

const user = authStore.user;

const emit = defineEmits([
    'editComment',
    'editReply',
])


onMounted(async () => {
    await fetchComments()    

    if (loading.value || !hasMore.value) return;
    observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            if (loading.value || !hasMore.value) return;
            await fetchComments();
        }
    }, {
        rootMargin: '100px',
    });

    if (loadMoreTrigger.value) {
        observer.observe(loadMoreTrigger.value);
    }

    socketStore.notificationSocket?.emit('join-post', {postId: postId})

    socketStore.notificationSocket?.on('comment-added', (newComment) => {                
        comments.value.unshift(newComment) 
    })

    socketStore.notificationSocket?.on('reply-comment-added', (newReplyComment) => {        
        if (!myNewReplies[newReplyComment.parentId]) {
            myNewReplies[newReplyComment.parentId] = []; 
        }
        myNewReplies[newReplyComment.parentId].push(newReplyComment);
    })
})

async function fetchComments() {
    if (loading.value || !hasMore.value) return;
    loading.value = true;

    try {
        const nextPage = currentPage.value + 1;
        const res = await getCommentToPost(postId, nextPage);

        const newComments = res.comments;
        if (newComments && newComments.length > 0) {
            
            if (!comments.value) {
                comments.value = newComments;
            } else {
                comments.value.push(...newComments);
            }
            currentPage.value = nextPage;
            hasMore.value = newComments.length === limit;
        } else {
            hasMore.value = false;
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
    } finally {
        loading.value = false;
    }
}


watch(loadMoreTrigger, (newVal, oldVal) => {
    if (oldVal && observer) observer.unobserve(oldVal);
    if (newVal && observer) observer.observe(newVal);
});


onBeforeUnmount(() => {
    if (observer && loadMoreTrigger.value) {
        observer.unobserve(loadMoreTrigger.value);
        observer.disconnect();
    }
});

onUnmounted(() => {
    socketStore.notificationSocket?.emit('leave-post', { postId: postId })
    socketStore.notificationSocket?.off('comment-added')
})


const submitComment = async () => {
    if (!newComment.value.trim()) return

    const comment = {
        content: newComment.value.trim(),
        postId: postId
    }
    const res = await createComment(comment)  
    
    
    // comments.value.unshift(res) 
    
    const updatedCommentCount = postStore.postsMap[postId].statistics.commentCount + 1;

    if (post) {
        postStore.updatePostMapField(postId, {
            statistics: {
                ...post.statistics,
                commentCount: updatedCommentCount
            }
        })
    }
    newComment.value = ''
}

const toggleReplyInput = (commentId) => {
    if (showReplyInput.value === commentId) {
        showReplyInput.value = null
        replyText.value = ''
    } else {
        showReplyInput.value = commentId
        replyText.value = ''
    }
}

const submitReply = async (commentId) => {
    if (!replyText.value.trim() || !post) return

    const comment = comments.value.find(c => c._id === commentId)
    if (comment) {
        const comment = {
            content: replyText.value.trim(),
            postId: postId,
            parentId: commentId
        }
        const res = await createComment(comment)
        if (res.parentId) {
            if (!myNewReplies[res.parentId]) {
                myNewReplies[res.parentId] = [];
            }
            // myNewReplies[res.parentId].push(res);
        }        

        const updatedCommentCount = postStore.postsMap[postId].statistics.commentCount + 1;
        postStore.updatePostMapField(postId, {
            statistics: {
                ...post.statistics,
                commentCount: updatedCommentCount
            }
        })           

        cancelReply()
    }
}


const cancelReply = () => {    
    showReplyInput.value = null
    replyText.value = ''
}

const toggleRepliesVisibility = async (commentId) => {    
    showReplies.value = showReplies.value === commentId ? null : commentId
    delete myNewReplies[commentId];

    if (showReplies.value === commentId) {
        const res = await getRepliesCommentByParent(commentId);
        if (Array.isArray(res.replies)) {
            repliesComment.value[commentId] = res.replies;
        }
    }
}

const navigateToResultUser = (username: any) => {
    if (username !== user?.username) {
        router.push({ path: `/${username}` });
    } else {
        router.push({ path: `/profile` });
    }

};

const toggleMenu = (id) => {
    showMenu.value = showMenu.value === id ? null : id
}

const toggleReplyLike = (commentId, replyId) => {
    const comment = comments.value.find(c => c._id === commentId)
    if (comment && comment.replies) {
        const reply = comment.replies.find(r => r._id === replyId)
        if (reply) {
            reply.liked = !reply.liked
            reply.likeCount += reply.liked ? 1 : -1
        }
    }
}

const toggleCommentLike = (commentId) => {
    const comment = comments.value.find(c => c._id === commentId) as Comment;
    if (comment) {
        comment.liked = !comment.liked
        comment.likeCount += comment.liked ? 1 : -1
    }
}

const editComment = (commentId) => {
    emit('editComment', commentId)
    showMenu.value = null
}

const deleteComment = async (commentId) => {
    await deleteCommentById(commentId);

    comments.value = comments.value.filter(comment => comment._id !== commentId);
    alert('Xóa thành công')
    showMenu.value = null
}

const editReply = (commentId, replyId) => {
    emit('editReply', commentId, replyId)
    showMenu.value = null
}

const deleteReply = async (commentId, replyId) => {
    await deleteCommentById(replyId);
    repliesComment.value[commentId] = repliesComment.value[commentId].filter(c => c._id !== replyId);
    alert('Xóa reply thành công')
    showMenu.value = null
}

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

</script>

<style scoped>
.comment-input-section {
    display: flex;
    padding: 16px 20px;
    border-bottom: 1px solid #e1e8ed;
    gap: 12px;
}

.comment-input-wrapper {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 12px;
}

.comment-input {
    flex: 1;
    min-height: 40px;
    max-height: 120px;
    padding: 12px;
    border: 1px solid #e1e8ed;
    border-radius: 20px;
    resize: none;
    font-size: 16px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
}

.comment-input:focus {
    border-color: #0f1419;
}

.submit-comment-btn {
    background: #0f1419;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.submit-comment-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.submit-comment-btn:not(:disabled):hover {
    background: #272c30;
}

.comments-section {
    padding: 20px;
}

.comments-title {
    font-size: 19px;
    font-weight: 600;
    margin: 0 0 25px 15px;
    color: #0f1419;
}

.no-comments {
    text-align: center;
    padding: 40px 20px;
    color: #657786;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.comment-thread {
    display: flex;
    flex-direction: column;
}

.comment-item {
    display: flex;
    gap: 25px;
    position: relative;
}

.reply-item {
    display: flex;
    gap: 12px;
    position: relative;
}

.replies-list {
    margin-top: 16px;
    margin-left: 60px;
    padding-left: 20px;
    border-left: 2px solid #f7f7f7;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    margin-left: 20px;
}

.avatar.small {
    width: 32px;
    height: 32px;
}

.comment-content {
    flex: 1;
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    position: relative;
}

.comment-author {
    font-weight: 600;
    color: #0f1419;
    font-size: 19px;
    cursor: pointer;
}

.comment-username {
    color: #657786;
    font-size: 16px;
}

.comment-time {
    color: #657786;
    font-size: 16px;
}

.comment-menu {
    margin-left: auto;
    position: relative;
}

.menu-trigger {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    color: #657786;
    transition: all 0.2s;
}

.menu-trigger:hover {
    background-color: #f7f7f7;
    color: #0f1419;
}

.menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    min-width: 120px;
    overflow: hidden;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #0f1419;
    transition: background-color 0.2s;
}

.menu-item:hover {
    background-color: #f7f7f7;
}

.menu-item.delete {
    color: #e74c3c;
}

.menu-item.delete:hover {
    background-color: #fef2f2;
}

.comment-text {
    margin: 0 0 8px 0;
    font-size: 17px;
    line-height: 1.4;
    color: #0f1419;
}

.comment-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.comment-action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 17px;
    color: #657786;
    transition: all 0.2s;
}

.comment-action-btn:hover {
    background-color: #f7f7f7;
}

.comment-action-btn.active {
    color: #ff3040;
}

.view-replies-btn {
    font-weight: 500;
}

.view-replies-btn:hover {
    color: #0f1419;
}

.reply-input-section {
    margin-top: 12px;
    display: flex;
    gap: 8px;
    align-items: flex-start;
}

.reply-input-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.reply-input {
    width: 100%;
    min-height: 60px;
    max-height: 120px;
    padding: 8px 12px;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
    resize: none;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
}

.reply-input:focus {
    border-color: #0f1419;
}

.reply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.cancel-reply-btn {
    background: none;
    color: #657786;
    border: 1px solid #e1e8ed;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.cancel-reply-btn:hover {
    background-color: #f7f7f7;
}

.submit-reply-btn {
    background: #0f1419;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.submit-reply-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.submit-reply-btn:not(:disabled):hover {
    background: #272c30;
}
</style>