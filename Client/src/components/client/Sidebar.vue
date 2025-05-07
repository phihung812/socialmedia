<template>
  <div class="sidebar">
    <div class="logo">
      <h1>Instagram</h1>
    </div>
    <div class="menu">
      <div class="menu-item active">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </div>
      <div class="menu-item">
        <i class="fas fa-search"></i>
        <span>Search</span>
      </div>
      <div class="menu-item">
        <i class="fas fa-paper-plane"></i>
        <span>Messages</span>
        <span class="message-count">5</span>
      </div>
      <div class="menu-item">
        <i class="fas fa-heart"></i>
        <span>Notifications</span>
      </div>
      <div class="menu-item">
        <i class="fas fa-plus-square"></i>
        <span>Create</span>
      </div>
      <div class="menu-item">
        <div class="profile-img">
          <img src="" alt="Profile" />
        </div>
        <span>Profile</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar'
}
</script>

<style scoped>
.sidebar {
  width: 270px;
  height: 100vh;
  background-color: white;
  border-right: 1px solid #dbdbdb;
  position: fixed;
  padding: 25px 12px;
  display: flex;
  flex-direction: column;
}

.logo {
  margin-bottom: 30px;
  padding-left: 12px;
}

.logo h1 {
  font-family: 'Roboto', cursive;
  font-size: 24px;
  font-weight: 500;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #f2f2f2;
}

.menu-item.active {
  font-weight: 500;
}

.menu-item i {
  font-size: 22px;
  margin-right: 16px;
  width: 24px;
  text-align: center;
}

.menu-item span {
  font-size: 16px;
}

.profile-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
}

.profile-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-count {
  background-color: #ff3040;
  color: white;
  font-size: 12px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}
</style>