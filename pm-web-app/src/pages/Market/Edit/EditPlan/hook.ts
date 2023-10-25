import type {
  Mutation,
  MutationDeleteMarketPlanArgs,
  MutationPushMarketPlanArgs,
  QueryGroupsUsersArgs,
  MarketPlanInput,
  Query,
} from '@/apollo';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useModel } from 'umi';

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
  };
}
