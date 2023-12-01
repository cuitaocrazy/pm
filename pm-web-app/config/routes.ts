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
    access: 'canDaily',
    icon: 'solution',
  },
  {
    path: '/synthetical',
    name: 'synthetical',
    access: 'canSynt',
    icon: 'team',
    routes:[
      {
        path: '/synthetical/edit',
        name: 'syntEdit',
        component: './Project/Edit/EditSynt',
        access: 'canSyntEdit'
      },
      {
        path: '/synthetical/dailies',
        name: 'syntDailies',
        component: './Daily/View/BySynt',
        access: 'canSyntDailies'
      },
      {
        path: '/synthetical/empDailies',
        name: 'empDailies',
        component: './Daily/View/ByEmp',
        access: 'canEmpDailies'
      },
      {
        path: '/synthetical/empExpense',
        name: 'empExpense',
        component: './Expense/View/ByEmp',
        access: 'canEmpExpense'
      },
    ]
  },
  {
    path: '/project',
    name: 'project',
    access: 'canProj',
    icon: 'project',
    routes:[
      {
        path: '/project/allEdit',
        name: 'allEdit',
        component: './Project/Edit/EditProj',
        access: 'canProjAllEdit'
      },
      {
        path: '/project/edit',
        name: 'edit',
        component: './Project/Edit/EditProj',
        access: 'canProjEdit'
      },
      {
        path: '/project/editSalesActive',
        name: 'editSalesActive',
        component: './Project/Edit/EditActive',
        access: 'canEditSalesActive',
      },
      {
        path: '/project/editAfterSalesActive',
        name: 'editAfterSalesActive',
        component: './Project/Edit/EditActive',
        access: 'canEditAfterSalesActive',
      },
      {
        path: '/project/changeLeader',
        name: 'changeLeader',
        component: './Project/Edit/ChangeLeader',
        access: 'canChangeLeader' 
      },
      {
        path: '/project/projectView',
        name: 'projectView',
        component: './Project/View',
        access: 'canProjectView'
      },
      {
        path: '/project/projDailies',
        name: 'projDailies',
        component: './Daily/View/ByProj',
        access: 'canProjDailies'
      },
      {
        path: '/project/projWeeklies',
        name: 'projWeeklies',
        component: './Weekly/View/ByProj',
        access: 'canProjWeeklies'
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
    path: '/market',
    name: 'market',
    access: 'canMarket',
    icon: 'project',
    routes:[
      {
        path: '/market/custom',
        name: 'marketCustom',
        component: './Market/Edit/EditCustom',
        access: 'canMarketCustom'
      },
      {
        path: '/market/plan',
        name: 'marketPlan',
        component: './Market/Edit/EditPlan',
        access: 'canMarketPlan'
      },
    ]
  },
  {
    path: '/business',
    name: 'business',
    access: 'canBusiness',
    icon: 'accountBook',
    routes:[
      {
        path: '/business/customer',
        name: 'customer',
        component: './Business/Customer/Edit',
        access: 'canCustomer'
      },
      {
        path: '/business/agreement',
        name: 'agreement',
        component: './Business/Agreement/Edit',
        access: 'canAgreement'
      }
    ]
  },
  {
    path: '/expense',
    name: 'expense',
    access: 'canExpense',
    icon: 'accountBook',
    routes:[
      {
        path: '/expense/perExpense',
        name: 'perExpense',
        component: './Expense/Edit',
        access: 'canPerExpense'
      },
      // {
      //   path: '/expense/projExpense',
      //   name: 'projExpense',
      //   component: './Expense/Edit',
      //   access: 'canProExpense'
      // },
    ]
  },
  // {
  //   path: '/settlement',
  //   name: 'settlement',
  //   component: './Settlement',
  //   access: 'canSettlement',
  //   icon: 'container',
  // },
  {
    path: '/infoManage',
    name: 'infoManage',
    access: 'canInfoManage',
    icon: 'team',
    routes:[
      {
        path: '/infoManage/statu',
        name: 'statu',
        component: './InfoManage/Statu/Edit',
        access: 'canStatu'
      },
      {
        path: '/infoManage/industry',
        name: 'industry',
        component: './InfoManage/Industry/Edit',
        access: 'canIndustrial'
      },
      {
        path: '/infoManage/region',
        name: 'region',
        component: './InfoManage/Region/Edit',
        access: 'canRegion'
      },
      {
        path: '/infoManage/workCalendar',
        name: 'workCalendar',
        component: './WorkCalendar',
        access: 'canWorkCalendar',
        icon: 'calendar',
      }    
    ]
  },
  {
    component: './404',
  },
];
