  // src/router/index.ts
  import { createRouter, createWebHistory } from 'vue-router';
  import Admin from '../views/LayoutAdmin.vue';
  import User from '../components/admin/ListUser.vue';
  import Post from '../components/admin/ListPost.vue';

  import Client from '@/views/LayoutClient.vue';
  import Login from '@/views/Login.vue';
  import Register from '@/views/Register.vue';

  import Home from '@/components/client/home/Home.vue';
  import Search from '@/views/Search.vue';


  // profile
  import Profile from '@/views/ProfileMe.vue';
  import GridPost from '@/components/client/Profile/gridProfile/GridPost.vue';
  import Tag from '@/components/client/Profile/gridProfile/GridTag.vue';
  import Saved from '@/components/client/Profile/gridProfile/GridSaved.vue';
  import Setting from '@/components/client/Profile/setting/Setting.vue';
  import ProfilePanel from '@/components/client/Profile/setting/content/ProfilePanel.vue';
  import SecurityPanel from '@/components/client/Profile/setting/content/SecurityPanel.vue';
  import PrivacyPanel from '@/components/client/Profile/setting/content/PrivacyPanel.vue';
  import NotificationPanel from '@/components/client/Profile/setting/content/NotificationPanel.vue';
  import AppearancePanel from '@/components/client/Profile/setting/content/AppearancePanel.vue';
  import ProfileUser from '@/views/ProfileUser.vue';
  import DetailPost from '@/views/DetailPost.vue';
  import Message from '@/views/Message.vue';
import Empty from '@/components/client/message/Empty.vue';
import ChatDetail from '@/components/client/message/ChatDetail.vue';





  const routes = [
    {
      path: '/login',
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
    {
      path: '/',
      name: 'Client',
      component: Client,
      children: [
        {
          path: '',
          name: 'home',
          component: Home,
        },
        {
          path: ':username/:id([a-zA-Z0-9]+)',
          name: 'DetailPost',
          component: DetailPost,
          props: true,
        },
        {
          path: ':username',
          name: 'ProfileUser',
          component: ProfileUser,
          props: true,
        },
        {
          path: 'setting',
          name: 'setting',
          component: Setting,
          children: [
            {
              path: '',
              name: 'ProfilePanel',
              component: ProfilePanel,
            },
            {
              path: 'security',
              name: 'SecurityPanel',
              component: SecurityPanel,
            },
            {
              path: 'privacy',
              name: 'PrivacyPanel',
              component: PrivacyPanel,
            },
            {
              path: 'notification',
              name: 'NotificationPanel',
              component: NotificationPanel,
            },
            {
              path: 'appearance',
              name: 'AppearancePanel',
              component: AppearancePanel,
            },
          ],
        },
        {
          path: 'profile',
          name: 'profile',
          component: Profile,
          children: [
            {
              path: '',
              name: 'gridpost',
              component: GridPost,
            },
            {
              path: 'tag',
              name: 'tag',
              component: Tag,
            },
            {
              path: 'saved',
              name: 'saved',
              component: Saved,
            },
          ],
        },
        {
          path: 'search',
          name: 'search',
          component: Search,
        },
        {
          path: 'message',
          name: 'message',
          component: Message,
          children: [
            {
              path: '',
              name: 'homeMess',
              component: Empty,
            },
            {
              path: ':username',
              name: 'detailMessage',
              component: ChatDetail,
            },
          ],
        },
      ],
    },
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  export default router;
