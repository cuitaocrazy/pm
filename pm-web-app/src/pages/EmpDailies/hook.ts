import { useState, useEffect } from 'react';
import * as R from 'ramda';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryDailyArgs, EmployeeDaily } from '@/apollo';
import { buildProjName } from '@/pages/utils';

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

  useEffect(() => queryUsers(), [queryUsers]);
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

const buildDaily = (daily: EmployeeDaily) => ({
  ...daily,
  dailies: daily.dailies.map((d) => ({
    ...d,
    projs: d.projs.map((p) => ({
      ...p,
      project: {
        ...p.project,
        name: buildProjName(p.project.id, p.project.name),
      },
    })),
  })),
});

export function useDailyState() {
  const [userId, setUserId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryDailyArgs>(
    QueryDaily,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const daily = R.isNil(queryData)
    ? {
        id: '',
        dailies: [],
      }
    : buildDaily(queryData.daily);

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
