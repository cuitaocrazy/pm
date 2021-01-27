import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryProjCostsArgs } from '@/apollo';

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

const QueryCosts = gql`
  query($projId: String!) {
    projCosts(projId: $projId) {
      project {
        id
        name
      }
      costs {
        user {
          id
          name
        }
        amount
        createDate
        type
        description
      }
    }
  }
`;

export function useCostsState() {

  const [projId, setProjId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryProjCostsArgs>(QueryCosts, {
    fetchPolicy: 'no-cache',
  });

  const projCosts = queryData?.projCosts || {
    project: {
      id: projId,
      name: projId,
    },
    costs: [],
  };

  const queryCosts  = (projId: string) => {
    setProjId(projId);
    query({
      variables: {
        projId
      }
    });
  }

  return {
    loading: queryLoading,
    queryCosts,
    projId,
    projCosts,
  };
}
