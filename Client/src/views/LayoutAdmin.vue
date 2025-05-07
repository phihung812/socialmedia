<template>
    <div class="admin-layout">
        <AdminSidebar :collapsed="sidebarCollapsed" />
        <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
            <AdminHeader @toggle-sidebar="toggleSidebar" />
            <main class="content-wrapper">
                <router-view></router-view>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminSidebar from '../components/admin/AdminSidebar.vue';
import AdminHeader from '../components/admin/AdminHeader.vue';

const sidebarCollapsed = ref(false);

const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
};
</script>

<style scoped>
.admin-layout {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    background-color: #f5f7fa;
}

.main-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
}

.main-content.expanded {
    margin-left: 60px;
}

.content-wrapper {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}
</style>