import { useState, useEffect,useCallback } from 'react';
import * as R from 'ramda';
import { gql, useLazyQuery,useMutation } from '@apollo/client';
import type { Query,Mutation,
  MutationDeleteProjectArgs,
  MutationPushProjectArgs,
  ProjectInput,QueryProjectArgs } from '@/apollo';
  import { useBaseState } from '@/pages/utils/hook';
  import { useModel } from 'umi';
  import { projectClassify } from './utils';

const QueryUsers = gql`
  {
    dailyUsers {
      id
      name
      groups
    }
    workCalendar
    empDailys {
      id
      dailies {
        date
      }
    }
  }
`;

export function useUsersState() {
  const [queryUsers, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(QueryUsers, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {queryUsers()}, [queryUsers]);
  const users = queryData?.dailyUsers || [];
  const workCalendar = queryData?.workCalendar || [];
  const userDailiys = {};
    queryData?.empDailys.forEach(item => userDailiys[item.id] = item)

  return {
    loading: queryLoading,
    users,
    workCalendar,
    userDailiys
  };
}

const QueryDaily = gql`
  query GetDaily($userId: String!) {
    empDaily(userId: $userId) {
      employee {
        id
      }
      dailies {
        date
        dailyItems {
          project {
            id
            name
          }
          timeConsuming
          content
        }
      }
    }
  }
`;

export function useDailyState() {
  const [userId, setUserId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(
    QueryDaily,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const daily = R.isNil(queryData)
    ? {
        employee: { id: '' },
        dailies: [],
      }
    : queryData.empDaily;
  const queryDaily = (id: string) => {
    setUserId(id);
    query({
      variables: {
        userId: id,
      },
    });
  };

  return {
    loading: queryLoading,
    queryDaily,
    userId,
    daily,
  };
}
//为了做员工日报加项目详情而从项目查询里copy出来的
const queryGql = gql`
query ($isArchive: Boolean,$customersPageSize:Int,$pageSizeAgreements:Int,$superProjsPageSize:Int) {
    subordinates {
      id
      name
    }
    agreements(pageSize:$pageSizeAgreements) {
      result{id
      name}
    }
    projectAgreements {
      id
      agreementId
    }
    customers(pageSize:$customersPageSize) {
      result{id
      name
      industryCode
      regionCode
      salesman
      enable
      contacts {
        name
        phone
        tags
      }}
    }
    superProjs(isArchive: $isArchive,pageSize:$superProjsPageSize){
      result{id
      pId
      name
      contName
      customer
      leader
      group
      confirmYear
      salesLeader
      projStatus
      contStatus
      acceStatus
      contAmount
      recoAmount
      projBudget
      budgetFee
      budgetCost
      actualCost
      taxAmount
      description
      createDate
      updateTime
      participants
      status
      isArchive
      startTime
      endTime
      estimatedWorkload
      serviceCycle
      productDate
      acceptDate
      freePersonDays
      usedPersonDays
      requiredInspections
      actualInspections
      contacts {
        name
        duties
        phone
      }
      actives {
        name
        recorder
        date
        content
        fileList {
          uid
          name
          url
          status
          thumbUrl
        }
      }}
    }
  }
`;

const pushProjGql = gql`
  mutation ($proj: ProjectInput!) {
    pushProject(proj: $proj)
  }
`;

const deleteProjGql = gql`
  mutation ($id: ID!) {
    deleteProject(id: $id)
  }
`;
export function useProjStatus() {
  const [archive, setArchive] = useState(false);
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryProjectArgs>(queryGql, {
    variables: {
      isArchive: archive,
      customersPageSize:10000000,
      pageSizeAgreements:10000000,
      superProjsPageSize:10000000
    },
    fetchPolicy: 'no-cache',
  });

  const [deleteProjHandle, { loading: deleteLoading }] = useMutation<Mutation, MutationDeleteProjectArgs>(
    deleteProjGql
  );
  const [pushCostHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushProjectArgs>(
    pushProjGql,
  );

  const { refresh: initialRefresh } = useModel('@@initialState');
  const { buildProjName } = useBaseState();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);
  const tmpProjs = queryData?.superProjs.result || [];

  const projs = projectClassify(R.filter(el => buildProjName(el.id, el.name).indexOf(filter) > -1, tmpProjs))
  const subordinates = queryData?.subordinates || [];
  const customers = queryData?.customers.result || [];
  const agreements = queryData?.agreements.result || [];
  const projectAgreements = queryData?.projectAgreements || [];

  const deleteProj = useCallback(
    async (id: string) => {
      // await deleteProjHandle({ variables: { id } });
      refresh();
    },
    [deleteProjHandle, refresh],
  );

  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      // if (proj.status === 'endProj') { return }
      // let reqProj = await attachmentUpload(proj, buildProjName)
      // await pushCostHandle({
      //   variables: {
      //     proj: reqProj
      //   },
      // });
      refresh();
    },
    [pushCostHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    projs,
    subordinates,
    customers,
    agreements,
    projectAgreements,
    filter,
    archive,
    setArchive,
    setFilter,
    refresh,
    deleteProj,
    pushProj,
  };
}
