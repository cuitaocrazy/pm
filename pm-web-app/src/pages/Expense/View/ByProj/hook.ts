import { useState, useEffect } from 'react';
import * as R from 'ramda';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryProjCostsArgs } from '@/apollo';

const QueryProjs = gql`
  query($pageSize:Int){
    iLeadProjs(pageSize:$pageSize) {
      result{id
      name}
    }
  }
`;

export function useProjsState() {
  const [queryUsers, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(QueryProjs, {
    fetchPolicy: 'no-cache',
    variables:{
      pageSize:10000000
    }
  });

  useEffect(() => {queryUsers()}, [queryUsers]);
  const projs = queryData?.iLeadProjs.result || [];

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
      items {
        employee {
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

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryProjCostsArgs
  >(QueryCosts, {
    fetchPolicy: 'no-cache',
  });

  const projCosts = R.isNil(queryData)
    ? {
        project: {
          id: projId,
          name: projId,
        },
        items: [],
      }
    : queryData.projCosts;

  const queryCosts = (id: string) => {
    setProjId(id);
    query({
      variables: {
        projId: id,
      },
    });
  };

  return {
    loading: queryLoading,
    queryCosts,
    projId,
    projCosts,
  };
}
