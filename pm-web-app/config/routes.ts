export default [
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/dailies',
    name: 'dailies',
    component: './Dailies'
  },
  {
    path: '/projects',
    name: 'projects',
    component: './Proj'
  },
  {
    component: './404',
  },
];
