import { useCallback, useEffect, useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import type { ChangePmInput, Mutation, Query, MutationPushChangePmArgs } from '@/apollo';
import type { User } from '@/apollo';
import { message } from 'antd';
import { useModel } from 'umi';

const QueryChangePmGql = gql`
query($name: String, $leaders: [String!], $page: Int, $pageSize: Int) {
    dailyUsers {
      id
      name
      groups
      enabled
    }
    realSubordinates {
      id
      name
      enabled
    }
    
    superProjs(name: $name, leaders:$leaders, page: $page, pageSize: $pageSize) {
      result{
        id
        name
        leader
        isArchive
      }
      page
      total
    }
  }
`;

const pushChangePmGql = gql`
  mutation ($changePm: ChangePmInput!) {
    pushChangePm(changePm: $changePm)
  }
`;

export function useChangePmState() {
  let [query, setQuery] = useState({});

  const [refresh, { data: queryData }] = useLazyQuery<Query>(QueryChangePmGql, {
    variables: {
      ...query
    },
    fetchPolicy: 'no-cache',
  });
  // const { refresh: initialRefresh } = useModel('@@initialState');

  useEffect(() => {
    refresh();
  }, [refresh, query]);
  const users: User[] = queryData?.dailyUsers || [];
  const { initialState } = useModel('@@initialState');
  console.log(initialState?.currentUser,'initialState?.currentUser KKKK')
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

  const projs = queryData?.superProjs.result.filter((proj) => isMember(proj.leader)) || [];
  const realSubordinates = queryData?.realSubordinates
  const page = queryData?.superProjs.page
  const total = queryData?.superProjs.total
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
    setQuery,
    query,
    realSubordinates,
    page,
    total
  };
}
