import type {
  Mutation,
  MutationPushProjectArgs,
  ProjectInput,
} from '@/apollo';
import { gql, useMutation } from '@apollo/client';
import { useCallback, useState } from 'react';
import { useBaseState } from '@/pages/utils/hook';
import { attachmentUpload } from './utils';

const pushProjGql = gql`
  mutation ($proj: ProjectInput!) {
    pushProject(proj: $proj)
  }
`;
export function useProjStatus() {
  const [archive, setArchive] = useState('0');
  const [pushCostHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushProjectArgs>(
    pushProjGql,
  );
  const { buildProjName } = useBaseState();
  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      let reqProj = await attachmentUpload(proj, buildProjName)
      await pushCostHandle({
        variables: {
          proj: reqProj
        },
      });
    },
    [pushCostHandle],
  );

  return {
    loading: pushLoading,
    archive,
    setArchive,
    pushProj,
  };
}
