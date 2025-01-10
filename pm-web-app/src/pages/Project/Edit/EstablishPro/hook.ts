import type { Mutation, MutationPushProjectArgs, ProjectInput } from '@/apollo';
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
      let reqProj = await attachmentUpload(proj, buildProjName);
      
      if(reqProj.id.includes('-ZH-')){
        reqProj.proState = 1;
      }else{
        reqProj.proState = 0; //0-待审核，1-审核通过，2-审核驳回
      }
      // console.log(reqProj,'reqProj JJKKLLL')
      // reqProj.incomeConfirm = 0; //0-未确认，1-待确认，2-已确认
      reqProj.contractState = 0; //0-未签署，1-已签署
      
      await pushCostHandle({
        variables: {
          proj: reqProj,
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
