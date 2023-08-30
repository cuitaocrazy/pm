import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dailies'
  },
  {
    path: '/dailies',
    name: 'dailies',
    // route level code-splitting
    // this generates a separate chunk (dailies.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "dailies" */
        '../views/dailies/DailiesView.vue'
      ),
  },
  {
    path: '/project',
    name: 'project',
    // route level code-splitting
    // this generates a separate chunk (project.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "project" */
        '../views/project/ProjectView.vue'
      ),
  },
  {
    path: '/active',
    name: 'active',
    // route level code-splitting
    // this generates a separate chunk (active.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "active" */
        '../views/active/ActiveView.vue'
      ),
  },
  {
    path: '/mine',
    name: 'mine',
    // route level code-splitting
    // this generates a separate chunk (mine.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "mine" */
        '../views/mine/MineView.vue'
      ),
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "about" */
        '../views/AboutView.vue'
      ),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/mb'),
  routes,
});

export default router;
