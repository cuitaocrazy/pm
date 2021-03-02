import { useCallback, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import type { ChangePmInput, Mutation, Query, MutationchangePmArgs } from '@/apollo';
import { message } from 'antd';
import type { Project } from '@/apollo';
import { buildProjName } from '../utils';

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

const RevertProjectName = (proj: Project) => {
  return { ...proj, ...{ name: buildProjName(proj.id, proj.name) } };
};

export function useChangePmState() {
  const [refresh, { data: queryData }] = useLazyQuery<Query>(QueryChangePmGql, {
    fetchPolicy: 'no-cache',
  });
  useEffect(() => refresh(), [refresh]);
  const users = queryData?.subordinates || [];
  const isMember = (userId: string) => {
    return users.filter((user) => user.id === userId).length > 0;
  };
  const projs =
    queryData?.projs
      .filter((proj) => isMember(proj.leader))
      .map((proj) => RevertProjectName(proj)) || [];
  const [pushChangePmHandle] = useMutation<Mutation, MutationchangePmArgs>(pushChangePmGql);
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
