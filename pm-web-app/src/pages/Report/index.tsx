import React from 'react';
import { useModel } from 'umi';
import * as R from 'ramda';
import Supervisor from './Supervisor';
import GroupLeader from './GroupLeader';
import ProjectManager from './ProjectManager';
import Default from './Default';

const Report = () => {

  const { initialState } = useModel('@@initialState');
  const access = initialState?.currentUser?.access || []

  return R.cond<string[], React.ReactNode>([
    [R.includes('realm:supervisor'),  R.always(<Supervisor/>)],
    [R.includes('realm:group_leader'), R.always(<GroupLeader/>)],
    [R.includes('realm:project_manager'), R.always(<ProjectManager/>)],
    [R.T, R.always(<Default/>)]
  ])(access);
}

export default Report;
