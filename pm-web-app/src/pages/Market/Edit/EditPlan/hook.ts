import type {
  Mutation,
  MutationDeleteMarketPlanArgs,
  MutationPushMarketPlanArgs,
  QueryGroupsUsersArgs,
  MarketPlanInput,
  Query,
  MarketPlan,
} from '@/apollo';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useModel } from 'umi';
import axios from 'axios'

const getGql = (gqlName: string) => {
  return gql`
    {
      ${ gqlName } {
        id
        leader
        week
        weekPlans {
          marketId
          marketName
          projectName
          projectScale
          projectStatus
          projectPlan
          weekWork
          nextWeekPlan
        }
        createDate
        updateTime
      }
      subordinates {
        id
        name
      }
      markets {
        id
        name
        leader
        projects {
          name
          introduct
          plan
          status
        }
      }
    }
  `;
} 

const userQuery = gql`
  query($groups: [String!]) {
    groupsUsers(groups: $groups) {
      id
      name
    }
  }
`;

const pushMarketPlanGql = gql`
  mutation ($marketPlan: MarketPlanInput!) {
    pushMarketPlan(marketPlan: $marketPlan)
  }
`;

const deleteMarketPlanGql = gql`
  mutation ($id: ID!) {
    deleteMarketPlan(id: $id)
  }
`;

export function useProjStatus() {
  const { refresh: initialRefresh, initialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.access?.includes('realm:supervisor')
  const queryGql = getGql( isAdmin ? 'marketPlansBySuper' : 'marketPlans' )
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });

  const { data: resData } = useQuery<Query, QueryGroupsUsersArgs>(userQuery, { fetchPolicy: 'no-cache', variables: {
    groups: ['/软件事业部/项目一部/市场组', '/软件事业部/项目二部/市场组', '/软件事业部/创新业务部/市场组'],
  } });

  const [deleteMarketPlanHandle, { loading: deleteLoading }] = useMutation<Mutation, MutationDeleteMarketPlanArgs>(
    deleteMarketPlanGql
  );
  const [pushMarketPlanHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushMarketPlanArgs>(
    pushMarketPlanGql,
  );

  const [filter, setFilter] = useState('');
    
  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);
  const markets = queryData?.markets || []
  const subordinates = queryData?.subordinates || [];
  const groupsUsers = resData?.groupsUsers || []
  let marketPlans = (isAdmin ? queryData?.marketPlansBySuper : queryData?.marketPlans)  || []
  if (filter) {
    marketPlans = marketPlans.filter(m => m.leader === filter)
  }

  const deleteMarketPlan = useCallback(
    async (id: string) => {
      await deleteMarketPlanHandle({ variables: { id } });
      refresh();
    },
    [deleteMarketPlanHandle, refresh],
  );

  const pushMarketPlan = useCallback(
    async (marketPlan: MarketPlanInput) => {
      await pushMarketPlanHandle({
        variables: {
          marketPlan: marketPlan
        },
      });
      refresh();
    },
    [pushMarketPlanHandle, refresh],
  );

  const exportExcel = async (record: MarketPlan) => {
    let reportName = subordinates.find((user) => user.id === record.leader)?.name;
    await axios.get('/api/export', { responseType: 'blob', params: { id: record.id, reportName } }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportName}-${record.week}-工作周报.xlsx`);
      document.body.appendChild(link);
      link.click();
    });
  }

  return {
    isAdmin,
    loading: queryLoading || deleteLoading || pushLoading,
    markets,
    marketPlans,
    subordinates,
    groupsUsers,
    filter, 
    setFilter,
    refresh,
    deleteMarketPlan,
    pushMarketPlan,
    exportExcel
  };
}
