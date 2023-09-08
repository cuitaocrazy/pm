import type {
  Mutation,
  MutationDeleteProjectArgs,
  MutationPushProjectArgs,
  ProjectInput,
  Query,
  QueryProjectArgs
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useBaseState } from '@/pages/utils/hook';
import { useModel } from 'umi';
import * as R from 'ramda';
import { projectClassify } from './utils';

const queryGql = gql`
query ($isArchive: Boolean) {
    subordinates {
      id
      name
    }
    agreements {
      id
      name
    }
    projectAgreements {
      id
      agreementId
    }
    customers {
      id
      name
      industryCode
      regionCode
      salesman
      enable
      contacts {
        name
        phone
        tags
      }
    }
    projs(isArchive: $isArchive){
      id
      pId
      name
      contName
      customer
      leader
      salesLeader
      projStatus
      contStatus
      acceStatus
      contAmount
      recoAmount
      projBudget
      budgetFee
      budgetCost
      actualFee
      actualCost
      taxAmount
      description
      createDate
      updateTime
      participants
      status
      isArchive
      startTime
      endTime
      estimatedWorkload
      serviceCycle
      productDate
      acceptDate
      freePersonDays
      usedPersonDays
      requiredInspections
      actualInspections
      contacts {
        name
        duties
        phone
      }
      actives {
        recorder
        date
        content
        fileList {
          uid
          name
          url
          status
          thumbUrl
        }
      }
    }
  }
`;

const pushProjGql = gql`
  mutation ($proj: ProjectInput!) {
    pushProject(proj: $proj)
  }
`;

const deleteProjGql = gql`
  mutation ($id: ID!) {
    deleteProject(id: $id)
  }
`;

export function useProjStatus() {
  const [archive, setArchive] = useState(false);
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryProjectArgs>(queryGql, {
    variables: {
      isArchive: archive
    },
    fetchPolicy: 'no-cache',
  });

  const [deleteProjHandle, { loading: deleteLoading }] = useMutation<Mutation, MutationDeleteProjectArgs>(
    deleteProjGql
  );
  const [pushCostHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushProjectArgs>(
    pushProjGql,
  );

  const { refresh: initialRefresh } = useModel('@@initialState');
  const { buildProjName } = useBaseState();
  const [filter, setFilter] = useState('');
    
  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);
  const tmpProjs = queryData?.projs || [];

  const projs = projectClassify(R.filter(el => buildProjName(el.id, el.name).indexOf(filter) > -1, tmpProjs))
  const subordinates = queryData?.subordinates || [];
  const customers = queryData?.customers || [];
  const agreements = queryData?.agreements || [];
  const projectAgreements = queryData?.projectAgreements || [];

  const deleteProj = useCallback(
    async (id: string) => {
      // await deleteProjHandle({ variables: { id } });
      refresh();
    },
    [deleteProjHandle, refresh],
  );

  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      // if (proj.status === 'endProj') { return }
      // let reqProj = await attachmentUpload(proj, buildProjName)
      // await pushCostHandle({
      //   variables: {
      //     proj: reqProj
      //   },
      // });
      refresh();
    },
    [pushCostHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    projs,
    subordinates,
    customers,
    agreements,
    projectAgreements,
    filter, 
    archive, 
    setArchive,
    setFilter,
    refresh,
    deleteProj,
    pushProj,
  };
}
