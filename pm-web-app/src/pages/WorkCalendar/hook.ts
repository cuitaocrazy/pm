import { useCallback, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import {
  Mutation,
  MutationPushWorkCalendarArgs,
  MutationDeleteWorkCalendarArgs,
  Query,
} from '@/apollo';

const queryGql = gql`
  {
    workCalendar
    settleMonth
  }
`;

const pushDaysGql = gql`
  mutation($data: [String!]!) {
    pushWorkCalendar(data: $data)
  }
`;

const deleteDaysGql = gql`
  mutation($data: [String!]!) {
    deleteWorkCalendar(data: $data)
  }
`;

export function useDaysStatus() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteDaysHandle, { loading: deleteLoading }] = useMutation<Mutation, MutationDeleteWorkCalendarArgs>(
    deleteDaysGql
  );
  const [pushDaysHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushWorkCalendarArgs>(
    pushDaysGql,
  );

  useEffect(() => refresh(), [refresh]);
  const days = queryData?.workCalendar || [];
  const months = queryData?.settleMonth || [];

  const deleteDays = useCallback(
    async (data: string[]) => {
      await deleteDaysHandle({
        variables: {
          data,
        }
      });
      refresh();
    },
    [deleteDaysHandle, refresh],
  );

  const pushDays = useCallback(
    async (data: string[]) => {
      await pushDaysHandle({
        variables: {
          data,
        },
      });
      refresh();
    },
    [pushDaysHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    days,
    months,
    refresh,
    deleteDays,
    pushDays,
  };
}
