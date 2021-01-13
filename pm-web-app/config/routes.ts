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
    component: './Dailies',
    access: 'canDaily'
  },
  {
    path: '/projects',
    name: 'projects',
    component: './Proj',
    access: 'canProj'
  },
  {
    path: '/costs',
    name: 'costs',
    component: './Cost',
    access: 'canCost'
  },
  {
    path: '/empDailies',
    name: 'empDailies',
    component: './EmpDailies',
    access: 'canEmpDailies'
  },
  {
    path: '/projDailies',
    name: 'projDailies',
    component: './ProjDailies',
    access: 'canProjDailies'
  },
  {
    component: './404',
  },
];
