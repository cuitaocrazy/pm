import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryEmpCostsArgs } from '@/apollo';

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

export function useCostsState() {

  const [userId, setUserId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryEmpCostsArgs>(QueryCosts, {
    fetchPolicy: 'no-cache',
  });

  const empCosts = queryData?.empCosts || {
    user: {
      id: userId,
      name: userId,
    },
    costs: [],
  };

  const queryCosts  = (userId: string) => {
    setUserId(userId);
    query({
      variables: {
        userId
      }
    });
  }

  return {
    loading: queryLoading,
    queryCosts,
    userId,
    empCosts,
  };
}