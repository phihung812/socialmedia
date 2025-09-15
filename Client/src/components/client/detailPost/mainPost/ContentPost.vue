<template>
    <div class="post-content">
        <p class="post-text">{{ post.caption }}</p>

        <div v-if="post.images && post.images.length > 0" class="image-gallery"
            :class="getGalleryClass(post.images.length)">
            <div v-for="(image, index) in post.images" :key="index" class="image-item" @click="openImageModal(index)">
                <img :src="image.image_url" :alt="`Ảnh ${index + 1}`" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Post } from '@/views/Search.vue'
import { ref } from 'vue';


const props = defineProps<{
    post: Post;
}>()
const emit = defineEmits(['openImageModal'])

const openImageModal = (index) => {
    emit('openImageModal', index )
}

const getGalleryClass = (imageCount) => {
    if (imageCount === 1) return 'single-image'
    if (imageCount === 2) return 'two-images'
    if (imageCount === 3) return 'three-images'
    return 'multiple-images'
}



</script>

<style scoped>
.post-content {
    margin-left: 70px;
}

.post-text {
    font-size: 18px;
    line-height: 1.5;
    color: #0f1419;
    margin: 0 0 16px 0;
    white-space: pre-wrap;
}

.image-gallery {
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 16px;
    display: grid;
    gap: 2px;
}

.single-image {
    grid-template-columns: 1fr;
}

.two-images {
    grid-template-columns: 1fr 1fr;
}

.three-images {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
}

.three-images .image-item:first-child {
    grid-row: 1 / 3;
}

.multiple-images {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
}

.image-item {
    cursor: pointer;
    overflow: hidden;
    background: #f7f7f7;
    aspect-ratio: 4/3;
}

.image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s;
}

.image-item:hover img {
    transform: scale(1.02);
}
</style>