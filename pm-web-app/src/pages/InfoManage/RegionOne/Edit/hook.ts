/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 15:31:52
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-11-21 16:57:08
 * @FilePath: /pm/pm-web-app/src/pages/InfoManage/RegionOne/Edit/hook.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type {
  Mutation,
  MutationDeleteRegionOneArgs,
  MutationPushRegionOneArgs,
  RegionOneInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { message } from 'antd';
const queryGql = gql`
  {
    regionones {
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
  mutation ($region: RegionOneInput!) {
    pushRegionOne(region: $region)
  }
`;

const deleteRegionGql = gql`
  mutation ($id: ID!) {
    deleteRegionOne(id: $id)
  }
`;

export function useRegionState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteRegionHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteRegionOneArgs
  >(deleteRegionGql);
  const [pushRegionHandle, { loading: pushLoading }] = useMutation<
    Mutation,
    MutationPushRegionOneArgs
  >(pushRegionGql);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const regions = queryData?.regionones || [];

  const deleteRegion = useCallback(
    async (id: string) => {
      await deleteRegionHandle({ variables: { id } });
      refresh();
    },
    [deleteRegionHandle, refresh],
  );

  const pushRegion = useCallback(
    async (region: RegionOneInput) => {
      await pushRegionHandle({
        variables: {
          region,
        },
      })
        .then(() => {
          refresh();
        })
        .catch((error) => {
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
