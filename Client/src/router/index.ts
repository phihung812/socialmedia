// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Admin from '../views/LayoutAdmin.vue';
import User from '../components/admin/ListUser.vue';
import Post from '../components/admin/ListPost.vue';

import Client from '../views/LayoutClient.vue';

import Login from '../views/Login.vue';
import Register from '../views/Register.vue';


const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Signup',
    component: Register,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    children: [
      {
        path: 'users',
        name: 'User',
        component: User,
      },
      {
        path: 'posts',
        name: 'Post',
        component: Post,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
