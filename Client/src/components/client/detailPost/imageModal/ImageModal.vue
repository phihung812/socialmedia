<template>
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
        <div class="modal-content" @click.stop>
            <button class="close-modal-btn" @click="closeImageModal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
            <img :src="post.images[currentImageIndex].image_url" alt="Ảnh post" />
            <div v-if="post.images.length > 1" class="modal-navigation">
                <button @click="prevImage" :disabled="currentImageIndex === 0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
                <span>{{ currentImageIndex + 1 }} / {{ post.images.length }}</span>
                <button @click="nextImage" :disabled="currentImageIndex === post.images.length - 1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="white" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Post } from '@/views/Search.vue'

const props = defineProps<{
    post: Post;
    showImageModal: boolean;
    currentImageIndex: number;
}>()
const emit = defineEmits(['update:showImageModal', 'update:currentImageIndex'])

const closeImageModal = () => {
    emit('update:showImageModal', false)
}

const nextImage = () => {
    if (props.currentImageIndex < (props.post.images.length - 1)) {
        emit('update:currentImageIndex', props.currentImageIndex + 1)
    }
}

const prevImage = () => {
    if (props.currentImageIndex > 0) {
        emit('update:currentImageIndex', props.currentImageIndex - 1)
    }
}


</script>

<style scoped>
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.modal-content img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 8px;
}

.close-modal-btn {
    position: absolute;
    top: -50px;
    right: 0;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.close-modal-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.modal-navigation {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    color: white;
}

.modal-navigation button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.modal-navigation button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
}

.modal-navigation button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>