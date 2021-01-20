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
    canCost: hasPower(['realm:assistant']),
    canEmpDailies: hasPower(['realm:group_leader', 'realm:supervisor']),
    canProjDailies: hasPower(['realm:project_manager']),
    canWorkCalendar: hasPower(['realm:assistant']),
  };
}
