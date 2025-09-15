import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createPinia } from 'pinia';
import pinia from './stores/index';

const app = createApp(App);
app.use(createPinia());
app.use(pinia);  
app.use(router);
app.mount('#app');