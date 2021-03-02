import { useCallback, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import type {
  Cost,
  CostInput,
  Mutation,
  MutationDeleteCostArgs,
  MutationPushCostArgs,
  Query,
} from '@/apollo';
import { buildProjName } from '@/pages/utils';

const queryGql = gql`
  {
    costs {
      id
      assignee
      participant {
        id
        name
      }
      projs {
        proj {
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
  mutation($id: ID!) {
    deleteCost(id: $id)
  }
`;

const pushCostGql = gql`
  mutation($cost: CostInput!) {
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

  useEffect(() => refresh(), [refresh]);

  const buildCosts = (c: Cost[]) =>
    c.map((cost) => ({
      ...cost,
      projs: cost.projs.map((pd) => ({
        ...pd,
        proj: { ...pd.proj, name: buildProjName(pd.proj.id, pd.proj.name) },
      })),
    })) || [];
  const costs = buildCosts(undefined === queryData?.costs ? [] : queryData?.costs);

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
    deleteCost,
    pushCost,
  };
}
