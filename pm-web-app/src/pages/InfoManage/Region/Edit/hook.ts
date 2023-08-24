import type {
  Mutation,
  MutationDeleteRegionArgs,
  MutationPushRegionArgs,
  RegionInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { message } from 'antd';
const queryGql = gql`
  {
    regions {
      id
      name
      code
      remark
      sort
      enable
      isDel
      createDate
    }
  }
`;

const pushRegionGql = gql`
  mutation ($region: RegionInput!) {
    pushRegion(region: $region)
  }
`;

const deleteRegionGql = gql`
  mutation ($id: ID!) {
    deleteRegion(id: $id)
  }
`;

export function useRegionState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteRegionHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteRegionArgs
  >(deleteRegionGql);
  const [pushRegionHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushRegionArgs>(
    pushRegionGql,
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const regions = queryData?.regions || [];

  const deleteRegion = useCallback(
    async (id: string) => {
      await deleteRegionHandle({ variables: { id } });
      refresh();
    },
    [deleteRegionHandle, refresh],
  );

  const pushRegion = useCallback(
    async (region: RegionInput) => {
      await pushRegionHandle({
        variables: {
          region,
        },
      }).then(() => {
        refresh();
      }).catch((error) => {
        message.error(error.message);
      });
    },
    [pushRegionHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    regions,
    refresh,
    deleteRegion,
    pushRegion,
  };
}
