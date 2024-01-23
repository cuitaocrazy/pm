import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryProjDailyArgs, QueryFilterProjectArgs } from '@/apollo';

const QueryProjs = gql`
query ($projType: String!) {
  filterProjsByType(projType: $projType) {
    id
    name
  }
}
`;

export function useProjsState() {
  const [queryUsers, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryFilterProjectArgs>(QueryProjs, {
    variables: {
      projType: 'ZH'
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {queryUsers()}, [queryUsers]);
  const projs = queryData?.filterProjsByType || [];

  return {
    loading: queryLoading,
    projs,
  };
}

const QueryDaily = gql`
  query GetDaily($projId: String!) {
    allProjDaily(projId: $projId) {
      project {
        id
      }
      dailies {
        date
        dailyItems {
          employee {
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
  const [projId, setProjId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryProjDailyArgs
  >(QueryDaily, {
    fetchPolicy: 'no-cache',
  });

  const daily = queryData?.allProjDaily || {
    id: '',
    dailies: [],
  };

  const queryDaily = (id: string) => {
    setProjId(id);
    query({
      variables: {
        projId: id,
      },
    });
  };

  return {
    loading: queryLoading,
    queryDaily,
    projId,
    daily,
  };
}
