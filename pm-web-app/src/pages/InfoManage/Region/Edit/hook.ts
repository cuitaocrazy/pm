/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 09:20:39
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-11-25 11:53:04
 * @FilePath: /pm/pm-web-app/src/pages/InfoManage/Region/Edit/hook.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
      parentId
      parentName
    }
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
  const [pushRegionHandle, { loading: pushLoading }] = useMutation<
    Mutation,
    MutationPushRegionArgs
  >(pushRegionGql);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const regions = queryData?.regions || [];
  const regionones = queryData?.regionones || [];

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
    regionones,
    refresh,
    deleteRegion,
    pushRegion,
  };
}
