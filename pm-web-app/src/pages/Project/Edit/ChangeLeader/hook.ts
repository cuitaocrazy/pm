import { useCallback, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import type { ChangePmInput, Mutation, Query, MutationPushChangePmArgs } from '@/apollo';
import type { User } from '@/apollo';
import { message } from 'antd';
import { useModel } from 'umi';

const QueryChangePmGql = gql`
  {
    dailyUsers {
      id
      name
      groups
    }
    superProjs {
      id
      name
      leader
    }
  }
`;

const pushChangePmGql = gql`
  mutation ($changePm: ChangePmInput!) {
    pushChangePm(changePm: $changePm)
  }
`;

export function useChangePmState() {
  const [refresh, { data: queryData }] = useLazyQuery<Query>(QueryChangePmGql, {
    fetchPolicy: 'no-cache',
  });
  useEffect(() => {
    refresh();
  }, [refresh]);
  const users: User[] = queryData?.dailyUsers || [];
  const { initialState } = useModel('@@initialState');
  if (initialState?.currentUser) {
    if (users.filter((user) => user.id === initialState?.currentUser?.id).length === 0) {
      const currentUser: User = {
        id: initialState?.currentUser.id || '',
        name: initialState.currentUser.name || '',
        access: initialState.currentUser.access || [],
        groups: initialState.currentUser.groups || [],
      };
      users.push(currentUser);
    }
  }
  const isMember = (userId: string) => {
    return users.filter((user) => user.id === userId).length > 0;
  };

  const projs = queryData?.superProjs.filter((proj) => isMember(proj.leader)) || [];
  const [pushChangePmHandle] = useMutation<Mutation, MutationPushChangePmArgs>(pushChangePmGql);
  const pushChangePm = useCallback(
    async (changePm: ChangePmInput) => {
      const result = await pushChangePmHandle({
        variables: { changePm },
      });
      refresh();
      if (result?.data?.pushChangePm) {
        message.success(`${result.data.pushChangePm}个项目修改项目经理成功`);
      }
    },
    [pushChangePmHandle, refresh],
  );

  return {
    pushChangePm,
    users,
    projs,
  };
}
