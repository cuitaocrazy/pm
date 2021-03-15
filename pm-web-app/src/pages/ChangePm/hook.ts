import { useCallback, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import type { ChangePmInput, Mutation, Query, MutationPushChangePmArgs } from '@/apollo';
import { message } from 'antd';

const QueryChangePmGql = gql`
  {
    subordinates {
      id
      name
    }
    projs {
      id
      name
      leader
    }
  }
`;

const pushChangePmGql = gql`
  mutation($changePm: ChangePmInput!) {
    pushChangePm(changePm: $changePm)
  }
`;

export function useChangePmState() {
  const [refresh, { data: queryData }] = useLazyQuery<Query>(QueryChangePmGql, {
    fetchPolicy: 'no-cache',
  });
  useEffect(() => refresh(), [refresh]);
  const users = queryData?.subordinates || [];
  const isMember = (userId: string) => {
    return users.filter((user) => user.id === userId).length > 0;
  };
  const projs = queryData?.projs.filter((proj) => isMember(proj.leader)) || [];
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
