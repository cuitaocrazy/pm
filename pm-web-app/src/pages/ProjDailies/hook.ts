import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryProjDailyArgs } from '@/apollo';

const QueryProjs = gql`
  {
    iLeadProjs {
      id
      name
    }
  }
`;

export function useProjsState() {
  const [queryUsers, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(QueryProjs, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => queryUsers(), [queryUsers]);
  const projs = queryData?.iLeadProjs || [];

  return {
    loading: queryLoading,
    projs,
  };
}

const QueryDaily = gql`
  query GetDaily($projId: String!) {
    projDaily(projId: $projId) {
      id
      dailies {
        date
        users {
          user {
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

  const daily = queryData?.projDaily || {
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
