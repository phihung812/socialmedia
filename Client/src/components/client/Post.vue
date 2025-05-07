<template>
  <div class="post">
    <div class="post-header">
      <div class="post-user">
        <div class="post-user-img">
          <img :src="post.userImg" alt="User" />
        </div>
        <p>{{ post.username }}</p>
      </div>
      <div class="post-options">
        <i class="fas fa-ellipsis-h"></i>
      </div>
    </div>
    <div class="post-img">
      <img :src="post.image" alt="Post" />
    </div>
    <div class="post-actions">
      <div class="post-actions-left">
        <i class="far fa-heart"></i>
        <i class="far fa-comment"></i>
        <i class="far fa-paper-plane"></i>
      </div>
      <div class="post-actions-right">
        <i class="far fa-bookmark"></i>
      </div>
    </div>
    <div class="post-likes">
      <p>{{ post.likes }} likes</p>
    </div>
    <div class="post-caption">
      <p><strong>{{ post.username }}</strong> {{ post.caption }}</p>
    </div>
    <div class="post-comments">
      <p class="view-comments">View all {{ post.comments.length }} comments</p>
      <div class="comment" v-for="(comment, index) in post.comments.slice(0, 2)" :key="index">
        <p><strong>{{ comment.username }}</strong> {{ comment.text }}</p>
      </div>
      <p class="post-time">{{ post.time }}</p>
    </div>
    <div class="add-comment">
      <i class="far fa-smile"></i>
      <input type="text" placeholder="Add a comment..." />
      <button>Post</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Post',
  props: {
    post: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.post {
  background-color: white;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  margin-bottom: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
}

.post-user {
  display: flex;
  align-items: center;
}

.post-user-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}

.post-user-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-options i {
  font-size: 16px;
  cursor: pointer;
}

.post-img {
  width: 100%;
}

.post-img img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  padding: 12px;
}

.post-actions-left {
  display: flex;
  gap: 16px;
}

.post-actions i {
  font-size: 24px;
  cursor: pointer;
}

.post-actions i:hover {
  opacity: 0.7;
}

.post-likes {
  padding: 0 12px;
  margin-bottom: 8px;
  font-weight: 500;
}

.post-caption {
  padding: 0 12px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.post-comments {
  padding: 0 12px;
  margin-bottom: 8px;
}

.view-comments {
  color: #8e8e8e;
  cursor: pointer;
  margin-bottom: 5px;
}

.comment {
  margin-bottom: 3px;
  line-height: 1.4;
}

.post-time {
  font-size: 10px;
  color: #8e8e8e;
  text-transform: uppercase;
  margin-top: 8px;
}

.add-comment {
  display: flex;
  align-items: center;
  padding: 12px;
  border-top: 1px solid #dbdbdb;
}

.add-comment i {
  font-size: 24px;
  margin-right: 12px;
  cursor: pointer;
}

.add-comment input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}

.add-comment button {
  border: none;
  background: none;
  color: #0095f6;
  font-weight: 500;
  cursor: pointer;
}

.add-comment button:disabled {
  opacity: 0.3;
}
</style>