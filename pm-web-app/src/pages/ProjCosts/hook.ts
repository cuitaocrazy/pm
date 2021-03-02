import { useState, useEffect } from 'react';
import * as R from 'ramda';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryProjCostsArgs, ProjectCosts } from '@/apollo';
import { buildProjName } from '@/pages/utils';

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
    projs: projs.map((p) => ({ ...p, name: buildProjName(p.id, p.name) })),
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

const buildProjCosts = (projCosts: ProjectCosts) => ({
  ...projCosts,
  project: {
    ...projCosts.project,
    name: buildProjName(projCosts.project.id, projCosts.project.name),
  },
});

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
        costs: [],
      }
    : buildProjCosts(queryData.projCosts);

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
