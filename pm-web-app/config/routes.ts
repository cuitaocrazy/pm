export default [
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Chart',
    hideInMenu: true,
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/dailies',
    name: 'dailies',
    component: './Daily/Write',
    access: 'canDaily'
  },
  {
    path: '/projects',
    name: 'projects',
    component: './Project/Edit',
    access: 'canProj'
  },
  {
    path: '/costs',
    name: 'costs',
    component: './Expense/Edit',
    access: 'canCost'
  },
  {
    path: '/empDailies',
    name: 'empDailies',
    component: './Daily/View/Emp',
    access: 'canEmpDailies'
  },
  {
    path: '/projDailies',
    name: 'projDailies',
    component: './Daily/View/Proj',
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
    component: './Expense/View/ByEmp',
    access: 'canEmpCosts'
  },
  {
    path: '/projCosts',
    name: 'projCosts',
    component: './Expense/View/ByProj',
    access: 'canProjCosts'
  },
  {
    path: '/settlement',
    name: 'settlement',
    component: './Settlement',
    access: 'canSettlement'
  },
  {
    path: '/changePm',
    name: 'changePm',
    component: './Project/ChangeLeader',
    access: 'canChangePm'
  },
  {
    component: './404',
  },
];
