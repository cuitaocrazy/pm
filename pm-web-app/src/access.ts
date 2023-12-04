// src/access.ts
import * as R from 'ramda';

export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  function hasPower(roles: string[]) {
    return R.intersection(roles, currentUser?.access || []).length > 0;
  }
  return {
    canDaily: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager','realm:assistant', 'realm:engineer', 'realm:marketer']),
    canSynt: hasPower(['realm:supervisor', 'realm:group_leader']),
    canSyntEdit: hasPower(['realm:supervisor', 'realm:group_leader']),
    canSyntDailies: hasPower(['realm:supervisor', 'realm:group_leader']),
    canEmpDailies: hasPower(['realm:supervisor', 'realm:group_leader']),
    canEmpExpense: hasPower(['realm:supervisor', 'realm:group_leader']),
    canProj: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager','realm:assistant', 'realm:engineer', 'realm:marketer']),
    canProjAllEdit: hasPower(['realm:supervisor']),
    canProjEdit: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager', 'realm:marketer']),
    canEditSalesActive: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager','realm:assistant', 'realm:engineer', 'realm:marketer']),
    canEditAfterSalesActive: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager','realm:assistant', 'realm:engineer', 'realm:marketer']),
    canChangeLeader: hasPower(['realm:supervisor', 'realm:group_leader']),
    canProjectView: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager', 'realm:assistant', 'realm:engineer', 'realm:marketer']),
    canProjDailies: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager', 'realm:marketer']),
    canProjWeeklies: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager', 'realm:marketer']),
    canProjExpense: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager', 'realm:marketer']),
    canMarket: hasPower(['realm:supervisor', 'realm:assistant', 'realm:marketer']),
    canMarketCustom:  hasPower(['realm:supervisor', 'realm:assistant', 'realm:marketer']),
    canMarketPlan:  hasPower(['realm:supervisor', 'realm:assistant', 'realm:marketer']),
    canBusiness:  hasPower(['realm:supervisor', 'realm:group_leader',  'realm:project_manager', 'realm:assistant', 'realm:marketer']),
    canCustomer: hasPower(['realm:supervisor', 'realm:group_leader',  'realm:project_manager', 'realm:assistant', 'realm:marketer']),
    canAgreement: hasPower(['realm:supervisor', 'realm:assistant']),
    canExpense: hasPower(['realm:supervisor', 'realm:assistant']),
    canPerExpense: hasPower(['realm:assistant']),
    canSettlement: hasPower(['realm:supervisor']),
    canInfoManage: hasPower(['realm:supervisor', 'realm:assistant']),
    canStatu: hasPower(['realm:supervisor', 'realm:assistant']),
    canIndustrial: hasPower(['realm:supervisor', 'realm:assistant']),
    canRegion: hasPower(['realm:supervisor', 'realm:assistant']),
    canWorkCalendar: hasPower(['realm:supervisor', 'realm:assistant']),
  };
}