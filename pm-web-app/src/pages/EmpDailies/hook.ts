import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryDailyArgs } from '@/apollo';

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

const QueryDaily = gql`
  query GetDaily($userId: String!) {
    daily(userId: $userId) {
      id
      dailies {
        date
        projs {
          project {
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

  const [userId, setUserId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryDailyArgs>(QueryDaily, {
    fetchPolicy: 'no-cache',
  });

  const daily = queryData?.daily || {
    id: '',
    dailies: [],
  };

  const queryDaily = (userId: string) => {
    setUserId(userId);
    query({
      variables: {
        userId
      }
    });
  }

  return {
    loading: queryLoading,
    queryDaily,
    userId,
    daily,
  };
}
