import type {
  Mutation,
  MutationDeleteStatuArgs,
  MutationPushStatuArgs,
  StatuInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { useModel } from 'umi';

const queryGql = gql`
  fragment TreeStatuFields on TreeStatu {
    id
    pId
    name
    code
    enable
    remark
    sort
    isDel
    createDate
    children {
      id
      pId
      name
      code
      enable
      remark
      sort
      isDel
      createDate
      children {
        id
        pId
        name
        code
        enable
        remark
        sort
        isDel
        createDate
      }
    }
  }
  {
    status {
      id
      pId
      name
      code
      enable
      remark
      sort
      isDel
      createDate
    }
    treeStatus {
      id
      pId
      name
      code
      enable
      remark
      sort
      isDel
      createDate
      children {
        ...TreeStatuFields
      }
    }
  }
`;

const pushStatuGql = gql`
  mutation ($statu: StatuInput!) {
    pushStatu(statu: $statu)
  }
`;

const deleteStatuGql = gql`
  mutation ($id: ID!) {
    deleteStatu(id: $id)
  }
`;

export function useStatusState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteStatuHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteStatuArgs
  >(deleteStatuGql);
  const [pushStatuHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushStatuArgs>(
    pushStatuGql,
  );


  useEffect(() => {
    refresh();
  }, [refresh]);

  const status = queryData?.treeStatus || [];
  const aaaaa = useModel('@@initialState');
  // setInitialState({...initialState, status: queryData?.status }) 

  const deleteStatu = useCallback(
    async (id: string) => {
      await deleteStatuHandle({ variables: { id } });
      refresh();
    },
    [deleteStatuHandle, refresh],
  );

  const pushStatu = useCallback(
    async (statu: StatuInput) => {
      await pushStatuHandle({
        variables: {
          statu,
        },
      });
      refresh();
      await aaaaa.refresh()
    },
    [pushStatuHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    status,
    refresh,
    deleteStatu,
    pushStatu,
  };
}
