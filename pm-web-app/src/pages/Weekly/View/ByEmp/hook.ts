import { useState, useEffect } from 'react';
import * as R from 'ramda';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryEmpDailyArgs } from '@/apollo';

const QueryUsers = gql`
  {
    dailyUsers {
      id
      name
      groups
    }
    workCalendar
  }
`;

export function useUsersState() {
  const [queryUsers, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(QueryUsers, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {queryUsers()}, [queryUsers]);
  const users = queryData?.dailyUsers || [];
  const workCalendar = queryData?.workCalendar || [];

  return {
    loading: queryLoading,
    users,
    workCalendar,
  };
}

const QueryDaily = gql`
  query GetDaily($userId: String!) {
    empDaily(userId: $userId) {
      employee {
        id
      }
      dailies {
        date
        dailyItems {
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

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryEmpDailyArgs>(
    QueryDaily,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const daily = R.isNil(queryData)
    ? {
        employee: { id: '' },
        dailies: [],
      }
    : queryData.empDaily;
  const queryDaily = (id: string) => {
    setUserId(id);
    query({
      variables: {
        userId: id,
      },
    });
  };

  return {
    loading: queryLoading,
    queryDaily,
    userId,
    daily,
  };
}
