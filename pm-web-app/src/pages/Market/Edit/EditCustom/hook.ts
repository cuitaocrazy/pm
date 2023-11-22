import type {
  Mutation,
  MutationDeleteMarketArgs,
  MutationPushMarketArgs,
  QueryGroupsUsersArgs,
  MarketInput,
  Query,
} from '@/apollo';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useModel } from 'umi';
import { attachmentUpload } from './utils';

const getGql = (gqlName: string) => {
  return gql`
    {
      subordinates {
        id
        name
      }
      ${ gqlName } {
        id
        name
        leader
        participants
        projects {
          name
          introduct
          scale
          plan
          status
          fileList {
            uid
            name
            status
            url
            thumbUrl
          }
          visitRecord {
            date
            content
            recorder
          }
          leader
        }
        contacts {
          name
          phone
          duties
          remark
        }
        createDate
        updateTime
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

const pushMarketGql = gql`
  mutation ($market: MarketInput!) {
    pushMarket(market: $market)
  }
`;

const deleteMarketGql = gql`
  mutation ($id: ID!) {
    deleteMarket(id: $id)
  }
`;

export function useProjStatus() {
  const { refresh: initialRefresh, initialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.access?.includes('realm:supervisor')

  const queryGql = getGql( isAdmin ? 'marketsBySuper' : 'markets' )
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });

  const { data: resData } = useQuery<Query, QueryGroupsUsersArgs>(userQuery, { fetchPolicy: 'no-cache', variables: {
    groups: ['/软件事业部/项目一部/市场组', '/软件事业部/项目二部/市场组', '/软件事业部/创新业务部/市场组'],
  } });

  const [deleteMarketHandle, { loading: deleteLoading }] = useMutation<Mutation, MutationDeleteMarketArgs>(
    deleteMarketGql
  );
  const [pushMarketHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushMarketArgs>(
    pushMarketGql,
  );

  const [filter, setFilter] = useState('');
    
  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);

  const subordinates = queryData?.subordinates || [];
  const groupsUsers = resData?.groupsUsers || []
  let markets = (isAdmin ? queryData?.marketsBySuper : queryData?.markets) || []
  if (filter) {
    markets = markets.filter(m => m.leader === filter)
  }

  const deleteMarket = useCallback(
    async (id: string) => {
      await deleteMarketHandle({ variables: { id } });
      refresh();
    },
    [deleteMarketHandle, refresh],
  );

  const pushMarket = useCallback(
    async (market: MarketInput) => {
      let reqMarket = await attachmentUpload(market)
      await pushMarketHandle({
        variables: {
          market: reqMarket
        },
      });
      refresh();
    },
    [pushMarketHandle, refresh],
  );

  return {
    isAdmin,
    loading: queryLoading || deleteLoading || pushLoading,
    markets,
    subordinates,
    groupsUsers,
    filter, 
    setFilter,
    refresh,
    deleteMarket,
    pushMarket,
  };
}
