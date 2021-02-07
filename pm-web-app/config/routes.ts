export default [
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
    hideInMenu: true,
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
    path: '/workCalendar',
    name: 'workCalendar',
    component: './WorkCalendar',
    access: 'canWorkCalendar'
  },
  {
    path: '/empCosts',
    name: 'empCosts',
    component: './EmpCosts',
    access: 'canEmpCosts'
  },
  {
    path: '/projCosts',
    name: 'projCosts',
    component: './ProjCosts',
    access: 'canProjCosts'
  },
  {
    path: '/settlement',
    name: 'settlement',
    component: './Settlement',
    access: 'canSettlement'
  },
  {
    component: './404',
  },
];
