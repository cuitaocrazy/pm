// src/access.ts
import * as R from 'ramda';

export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  function hasPower(roles: string[]) {
    return R.intersection(roles, currentUser?.access || []).length > 0;
  }
  return {
    canDaily: hasPower(['realm:project_manager', 'realm:engineer']),
    canProjectView: hasPower(['realm:supervisor', 'realm:group_leader', 'realm:project_manager', 'realm:engineer', 'realm:assistant']),
    canEmployee: hasPower(['realm:group_leader', 'realm:supervisor']),
    canEmpDailies: hasPower(['realm:group_leader', 'realm:supervisor']),
    canEmpExpense: hasPower(['realm:group_leader', 'realm:supervisor']),
    canProj: hasPower(['realm:group_leader', 'realm:supervisor', 'realm:project_manager', 'realm:engineer']),
    canProjAllEdit: hasPower(['realm:supervisor']),
    canProjEdit: hasPower(['realm:project_manager']),
    canEditSalesActive: hasPower(['realm:engineer']),
    canEditAfterSalesActive: hasPower(['realm:engineer']),
    canChangeLeader: hasPower(['realm:group_leader', 'realm:supervisor']),
    canProjDailies: hasPower(['realm:project_manager']),
    canProjExpense: hasPower(['realm:project_manager']),
    canProjWeeklies: hasPower(['realm:project_manager']),
    canExpense: hasPower(['realm:assistant']),
    canWorkCalendar: hasPower(['realm:assistant']),
    canSettlement: hasPower(['realm:supervisor']),
    canInfoManage: hasPower(['realm:supervisor', 'realm:assistant']),
    canStatu: hasPower(['realm:supervisor', 'realm:assistant']),
    canIndustrial: hasPower(['realm:supervisor', 'realm:assistant']),
    canRegion: hasPower(['realm:supervisor', 'realm:assistant']),
    canCustomer: hasPower(['realm:supervisor', 'realm:assistant']),
    canAgreement: hasPower(['realm:supervisor' ,'realm:assistant']),
  };
}
