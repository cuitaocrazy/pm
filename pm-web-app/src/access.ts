// src/access.ts
import * as R from 'ramda';

export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  function hasPower(roles: string[]) {
    return R.intersection(roles, currentUser?.access || []).length > 0;
  }
  return {
    canDaily: hasPower(['realm:project_manager', 'realm:engineer']),
    canProjectView: hasPower(['realm:supervisor', 'realm:project_manager', 'realm:engineer', 'realm:assistant']),
    canProj: hasPower(['realm:supervisor', 'realm:project_manager', 'realm:engineer']),
    canProjAllEdit: hasPower(['realm:supervisor']),
    canProjEdit: hasPower(['realm:project_manager']),
    canEditSalesActive: hasPower(['realm:engineer']),
    canEditAfterSalesActive: hasPower(['realm:engineer']),
    canProjDailies: hasPower(['realm:project_manager']),
    canProjExpense: hasPower(['realm:project_manager']),
    canProjWeeklies: hasPower(['realm:project_manager']),
    canChangeLeader: hasPower(['realm:group_leader', 'realm:supervisor']),
    canExpense: hasPower(['realm:assistant']),
    canEmpDailies: hasPower(['realm:group_leader', 'realm:supervisor']),
    canWorkCalendar: hasPower(['realm:assistant']),
    canEmpExpense: hasPower(['realm:group_leader', 'realm:supervisor']),
    canSettlement: hasPower(['realm:supervisor']),
    canEmployee: hasPower(['realm:project_manager']),
    canInfoManage: hasPower(['realm:supervisor', 'realm:assistant']),
    canStatu: hasPower(['realm:supervisor']),
    canIndustrial: hasPower(['realm:supervisor']),
    canRegion: hasPower(['realm:supervisor']),
    canCustomer: hasPower(['realm:assistant']),
    canAgreement: hasPower(['realm:assistant']),
  };
}
