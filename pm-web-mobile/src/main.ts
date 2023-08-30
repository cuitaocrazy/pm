import { createApp } from 'vue';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import router from './router';
import store from './store';
import TDesign from 'tdesign-mobile-vue';
import 'tdesign-mobile-vue/es/style/index.css';

// 与 API 的 HTTP 连接
const httpLink = createHttpLink({
  // 你需要在这里使用绝对路径
  uri: '/api/graphql',
  credentials: 'same-origin',
});
// 缓存实现
const cache = new InMemoryCache({
  addTypename: false,
});
// 创建 apollo 客户端
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});

const app = createApp(App);
app.provide(DefaultApolloClient, apolloClient);
app.use(TDesign)
// 挂载全局方法
app.use(store).use(router).mount('#app');
