import type {
  Mutation,
  MutationDeleteMarketArgs,
  MutationPushMarketArgs,
  MarketInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useModel, history } from 'umi';
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
          }
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
  const isAdmin = history?.location.pathname.split('/').pop() === 'allEdit' ? true : false;
  const queryGql = getGql( isAdmin ? 'markets' : 'markets' )
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });

  const [deleteMarketHandle, { loading: deleteLoading }] = useMutation<Mutation, MutationDeleteMarketArgs>(
    deleteMarketGql
  );
  const [pushMarketHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushMarketArgs>(
    pushMarketGql,
  );

  const { refresh: initialRefresh } = useModel('@@initialState');
  const [filter, setFilter] = useState('');
    
  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);

  const markets = queryData?.markets || []
  const subordinates = queryData?.subordinates || [];

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
    loading: queryLoading || deleteLoading || pushLoading,
    markets,
    subordinates,
    filter, 
    setFilter,
    refresh,
    deleteMarket,
    pushMarket,
  };
}
