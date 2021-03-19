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
    path: '/employee',
    name: 'employee',
    access: 'canEmployee',
    routes:[
      {
        path: '/employee/empDailies',
        name: 'empDailies',
        component: './Daily/View/ByEmp',
        access: 'canEmpDailies'
      },
      {
        path: '/employee/empExpense',
        name: 'empExpense',
        component: './Expense/View/ByEmp',
        access: 'canEmpExpense'
      },
    ]
  },
  {
    path: '/project',
    name: 'project',
    access: 'canProj',//todo
    routes:[
      {
        path: '/project/edit',
        name: 'edit',
        component: './Project/Edit',
        access: 'canProjEdit'
      },
      {
        path: '/project/changeLeader',
        name: 'changeLeader',
        component: './Project/ChangeLeader',
        access: 'canChangeLeader' 
      },
      {
        path: '/project/projDailies',
        name: 'projDailies',
        component: './Daily/View/ByProj',
        access: 'canProjDailies'
      },
      {
        path: '/project/projExpense',
        name: 'projExpense',
        component: './Expense/View/ByProj',
        access: 'canProjExpense'
      },
    ]
  },

  {
    path: '/expense',
    name: 'expense',
    component: './Expense/Edit',
    access: 'canExpense'
  },


  {
    path: '/workCalendar',
    name: 'workCalendar',
    component: './WorkCalendar',
    access: 'canWorkCalendar'
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
