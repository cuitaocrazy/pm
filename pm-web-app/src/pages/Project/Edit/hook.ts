import type {
  Mutation,
  MutationDeleteProjectArgs,
  MutationPushProjectArgs,
  ProjectInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';

const queryGql = gql`
  {
    iLeadProjs {
      id
      name
      budget
      createDate
      status
      participants
      contacts {
        name
        duties
        phone
      }
    }
  }
`;

const pushProjGql = gql`
  mutation($proj: ProjectInput!) {
    pushProject(proj: $proj)
  }
`;

const deleteProjGql = gql`
  mutation($id: ID!) {
    deleteProject(id: $id)
  }
`;

export function useProjStatus() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteProjHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteProjectArgs
  >(deleteProjGql);
  const [pushCostHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushProjectArgs>(
    pushProjGql,
  );

  useEffect(() => refresh(), [refresh]);
  const projs = queryData?.iLeadProjs || [];

  const deleteProj = useCallback(
    async (id: string) => {
      await deleteProjHandle({ variables: { id } });
      refresh();
    },
    [deleteProjHandle, refresh],
  );

  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      await pushCostHandle({
        variables: {
          proj,
        },
      });
      refresh();
    },
    [pushCostHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    projs,
    refresh,
    deleteProj,
    pushProj,
  };
}
