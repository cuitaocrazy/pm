import type {
  Mutation,
  MutationDeleteProjectClassArgs,
  MutationPushProjectClassArgs,
  ProjectClassInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { message } from 'antd';
const queryGql = gql`
  {
    projectClasses {
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

const pushProjectClassGql = gql`
  mutation ($projectclass: ProjectClassInput!) {
    pushProjectClass(projectClass: $projectclass)
  }
`;

const deleteProjectClassGql = gql`
  mutation ($id: ID!) {
    deleteProjectClass(id: $id)
  }
`;

export function useProjectClassState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteProjectClassHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteProjectClassArgs
  >(deleteProjectClassGql);
  const [pushProjectClassHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushProjectClassArgs>(
    pushProjectClassGql,
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const projectclasses = queryData?.projectClasses || [];

  const deleteProjectClass = useCallback(
    async (id: string) => {
      await deleteProjectClassHandle({ variables: { id } });
      refresh();
    },
    [deleteProjectClassHandle, refresh],
  );

  const pushProjectClass = useCallback(
    async (projectclass: ProjectClassInput) => {
      await pushProjectClassHandle({
        variables: {
          projectclass,
        },
      }).then(() => {
        refresh();
      }).catch((error) => {
        message.error(error.message);
      });
    },
    [pushProjectClassHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    projectclasses,
    refresh,
    deleteProjectClass,
    pushProjectClass,
  };
}
