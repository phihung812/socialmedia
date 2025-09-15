<template>
    <div class="photo-grid">
      <div class="grid-item">
        <img src="" alt="Được gắn thẻ" />
        <div class="hover-overlay">
          <div class="post-stats">
            <span><i class="heart-icon"></i>12</span>
            <span><i class="comment-icon"></i>42</span>
          </div>
        </div>
        <div class="post-actions">
          <button class="action-button"><i class="edit-icon"></i></button>
          <button class="action-button"><i class="delete-icon"></i></button>
        </div>
      </div>
      <div class="grid-item">
        <img src="" alt="Được gắn thẻ" />
        <div class="hover-overlay">
          <div class="post-stats">
            <span><i class="heart-icon"></i>12</span>
            <span><i class="comment-icon"></i>42</span>
          </div>
        </div>
        <div class="post-actions">
          <button class="action-button"><i class="edit-icon"></i></button>
          <button class="action-button"><i class="delete-icon"></i></button>
        </div>
      </div>
      <div class="grid-item">
        <img src="" alt="Được gắn thẻ" />
        <div class="hover-overlay">
          <div class="post-stats">
            <span><i class="heart-icon"></i>12</span>
            <span><i class="comment-icon"></i>42</span>
          </div>
        </div>
        <div class="post-actions">
          <button class="action-button"><i class="edit-icon"></i></button>
          <button class="action-button"><i class="delete-icon"></i></button>
        </div>
      </div>
      <div class="grid-item">
        <img src="" alt="Được gắn thẻ" />
        <div class="hover-overlay">
          <div class="post-stats">
            <span><i class="heart-icon"></i>12</span>
            <span><i class="comment-icon"></i>42</span>
          </div>
        </div>
        <div class="post-actions">
          <button class="action-button"><i class="edit-icon"></i></button>
          <button class="action-button"><i class="delete-icon"></i></button>
        </div>
      </div>
    </div>
</template>

<style scoped>
    .photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.grid-item {
  position: relative;
  aspect-ratio: 1/1;
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.grid-item:hover .hover-overlay {
  opacity: 1;
}

.grid-item:hover .post-actions {
  opacity: 1;
}

.post-stats {
  display: flex;
  color: white;
  font-weight: 600;
}

.post-stats span {
  margin: 0 10px;
  display: flex;
  align-items: center;
}

.heart-icon::before {
  content: "♥";
  margin-right: 7px;
}

.comment-icon::before {
  content: "💬";
  margin-right: 7px;
}

.bookmark-icon::before {
  content: "🔖";
}

.tag-icon::before {
  content: "👤";
}

.post-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: opacity 0.2s;
}

.action-button {
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
}

.edit-icon::before {
  content: "✏️";
}

.delete-icon::before {
  content: "🗑️";
}

.add-post-item, .add-reel-item {
  aspect-ratio: 1/1;
  border: 2px dashed #dbdbdb;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #fafafa;
}

.add-reel-item {
  aspect-ratio: 3/5;
}

.add-post-content, .add-reel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8e8e8e;
}

.plus-icon-large {
  font-size: 40px;
  margin-bottom: 8px;
}
</style>