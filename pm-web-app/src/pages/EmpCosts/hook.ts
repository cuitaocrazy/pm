import { useState, useEffect } from 'react';
import * as R from 'ramda';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryEmpCostsArgs, EmployeeCosts } from '@/apollo';
import { buildProjName } from '@/pages/utils';

const QueryUsers = gql`
  {
    dailyUsers {
      id
      name
      groups
    }
  }
`;

export function useUsersState() {
  const [queryUsers, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(QueryUsers, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => queryUsers(), [queryUsers]);
  const users = queryData?.dailyUsers || [];

  return {
    loading: queryLoading,
    users,
  };
}

const QueryCosts = gql`
  query($userId: String!) {
    empCosts(userId: $userId) {
      user {
        id
        name
      }
      costs {
        project {
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

const buildEmpCosts = (empCosts: EmployeeCosts) => ({
  ...empCosts,
  costs: empCosts.costs.map((c) => ({
    ...c,
    project: {
      ...c.project,
      name: buildProjName(c.project.id, c.project.name),
    },
  })),
});

export function useCostsState() {
  const [userId, setUserId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryEmpCostsArgs
  >(QueryCosts, {
    fetchPolicy: 'no-cache',
  });

  const empCosts = R.isNil(queryData)
    ? {
        user: {
          id: userId,
          name: userId,
        },
        costs: [],
      }
    : buildEmpCosts(queryData.empCosts);

  const queryCosts = (id: string) => {
    setUserId(id);
    query({
      variables: {
        userId: id,
      },
    });
  };

  return {
    loading: queryLoading,
    queryCosts,
    userId,
    empCosts,
  };
}
