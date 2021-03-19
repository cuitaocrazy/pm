// src/access.ts
import * as R from 'ramda';

export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  function hasPower(roles: string[]) {
    return R.intersection(roles, currentUser?.access || []).length > 0;
  }
  return {
    canDaily: hasPower(['realm:project_manager', 'realm:engineer']),
    canProj: hasPower(['realm:project_manager']),
    canProjEdit: hasPower(['realm:project_manager']),
    canExpense: hasPower(['realm:assistant']),
    canEmpDailies: hasPower(['realm:group_leader', 'realm:supervisor']),
    canProjDailies: hasPower(['realm:project_manager']),
    canWorkCalendar: hasPower(['realm:assistant']),
    canEmpExpense: hasPower(['realm:group_leader', 'realm:supervisor']),
    canProjExpense: hasPower(['realm:project_manager']),
    canSettlement: hasPower(['realm:supervisor']),
    canChangeLeader: hasPower(['realm:group_leader', 'realm:supervisor']),
    canEmployee: hasPower(['realm:project_manager']),
  };
}
