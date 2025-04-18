import { useCallback, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import type {
  CostInput,
  Mutation,
  MutationDeleteCostArgs,
  MutationPushCostArgs,
  Query,
} from '@/apollo';

const queryGql = gql`
  {
    subordinates {
      id
      name
    }
    expenses {
      id
      assignee
      participant {
        id
        name
      }
      items {
        project {
          id
          name
        }
        amount
        type
        description
      }
      createDate
    }
  }
`;

const deleteGql = gql`
  mutation ($id: ID!) {
    deleteCost(id: $id)
  }
`;

const pushCostGql = gql`
  mutation ($cost: CostInput!) {
    pushCost(cost: $cost)
  }
`;
export function useCostState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteCostHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteCostArgs
  >(deleteGql);
  const [pushProjHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushCostArgs>(
    pushCostGql,
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const costs = queryData?.expenses || [];

  const subordinates = queryData?.subordinates || [];

  const deleteCost = useCallback(
    async (id: string) => {
      await deleteCostHandle({ variables: { id } });
      refresh();
    },
    [deleteCostHandle, refresh],
  );

  const pushCost = useCallback(
    async (cost: CostInput) => {
      await pushProjHandle({
        variables: {
          cost,
        },
      });
      refresh();
    },
    [pushProjHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    costs,
    subordinates,
    deleteCost,
    pushCost,
  };
}
