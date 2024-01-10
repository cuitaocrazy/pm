import type {
  Mutation,
  MutationDeleteCustomerArgs,
  MutationPushCustomerArgs,
  CustomerInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { useModel } from 'umi';
const queryGql = gql`
  {
    subordinates {
      id
      name
    }
    customers {
      id
      name
      industryCode
      regionCode
      salesman
      officeAddress
      contacts {
        name
        phone
        tags
        recorder
        remark
      }
      remark
      enable
      isDel
      createDate
    }
    tags
  }
`;

const pushCustomerGql = gql`
  mutation ($customer: CustomerInput!) {
    pushCustomer(customer: $customer)
  }
`;

const deleteCustomerGql = gql`
  mutation ($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

export function useCustomerState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteCustomerHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteCustomerArgs
  >(deleteCustomerGql);
  const [pushCustomerHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushCustomerArgs>(
    pushCustomerGql,
  );
  const { refresh: initialRefresh } = useModel('@@initialState');

  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);

  const customers = queryData?.customers || [];
  const subordinates = queryData?.subordinates || [];

  const deleteCustomer = useCallback(
    async (id: string) => {
      await deleteCustomerHandle({ variables: { id } });
      refresh();
    },
    [deleteCustomerHandle, refresh],
  );

  const pushCustomer = useCallback(
    async (customer: CustomerInput) => {
      await pushCustomerHandle({
        variables: {
          customer,
        },
      })
      refresh()
    },
    [pushCustomerHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    customers,
    subordinates,
    refresh,
    deleteCustomer,
    pushCustomer,
  };
}
