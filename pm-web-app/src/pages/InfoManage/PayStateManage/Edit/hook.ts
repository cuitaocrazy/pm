/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 09:20:39
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-11-22 14:27:07
 * @FilePath: /pm/pm-web-app/src/pages/InfoManage/Region/Edit/hook.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type {
  Mutation,
  MutationDeletePayStateManageArgs,
  MutationPushPayStateManageArgs,
  PayStateManageInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { message } from 'antd';
const queryGql = gql`
  {
    payStateManages {
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

const pushPayStateManageGql = gql`
  mutation ($region: PayStateManageInput!) {
    pushPayStateManage(region: $region)
  }
`;

const deletePayStateManageGql = gql`
  mutation ($id: ID!) {
    deletePayStateManage(id: $id)
  }
`;

export function useRegionState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteRegionHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeletePayStateManageArgs
  >(deletePayStateManageGql);
  const [pushRegionHandle, { loading: pushLoading }] = useMutation<
    Mutation,
    MutationPushPayStateManageArgs
  >(pushPayStateManageGql);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const regions = queryData?.payStateManages || [];

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
    refresh,
    deleteRegion,
    pushRegion,
  };
}
