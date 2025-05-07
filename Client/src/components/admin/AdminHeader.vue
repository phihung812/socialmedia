<template>
    <header class="admin-header">
        <div class="toggle-sidebar" @click="$emit('toggle-sidebar')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </div>

        <div class="header-title">
            <h1>{{ pageTitle }}</h1>
        </div>

        <div class="header-actions">
            <div class="search-bar">
                <input type="text" placeholder="Tìm kiếm..." />
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>

            <div class="notification">
                <button class="icon-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span class="badge">3</span>
                </button>
            </div>

            <div class="profile-menu">
                <div class="profile-info">
                    <div class="avatar">
                        <img src="https://via.placeholder.com/40" alt="Avatar" />
                    </div>
                    <div class="user-info">
                        <span class="name">Admin</span>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Định nghĩa các tiêu đề trang dựa trên route
const routeTitles = {
    '/admin/dashboard': 'Dashboard',
    '/admin/projects': 'Quản lý dự án',
    '/admin/posts': 'Quản lý bài đăng',
    '/admin/analytics': 'Phân tích dữ liệu',
    '/admin/users': 'Quản lý người dùng',
    '/admin/settings': 'Cài đặt hệ thống'
};

// Tính toán tiêu đề dựa trên route hiện tại
const pageTitle = computed(() => {
    return routeTitles[route.path] || 'Dashboard';
});

// Định nghĩa emit events
defineEmits(['toggle-sidebar']);
</script>

<style scoped>
.admin-header {
    height: 70px;
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.toggle-sidebar {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #5a5a5a;
}

.toggle-sidebar:hover {
    color: #000;
    background-color: #f5f5f5;
    border-radius: 50%;
}

.header-title {
    margin-left: 15px;
    flex: 1;
}

.header-title h1 {
    font-size: 1.5rem;
    font-weight: 500;
    color: #333;
    margin: 0;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.search-bar {
    position: relative;
    width: 250px;
}

.search-bar input {
    width: 100%;
    height: 40px;
    padding: 0 40px 0 15px;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    font-size: 0.9rem;
}

.search-bar button {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #5a5a5a;
}

.icon-button {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5a5a5a;
}

.icon-button:hover {
    background-color: #f5f5f5;
}

.badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #e74c3c;
    color: white;
    font-size: 0.7rem;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.profile-menu {
    position: relative;
    cursor: pointer;
}

.profile-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.name {
    font-weight: 500;
    font-size: 0.9rem;
    color: #333;
}
</style>