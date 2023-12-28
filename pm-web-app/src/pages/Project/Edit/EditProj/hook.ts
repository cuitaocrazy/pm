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
import { useModel, history } from 'umi';
import * as R from 'ramda';
import { attachmentUpload, filterTodoProject, projectClassify } from './utils';

const getGql = (proName: string) => {
  return gql`
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
      ${ proName }(isArchive: $isArchive){
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
        humanFee
        projectFee
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
        timeConsuming
        confirmYear
        doYear
        actives {
          name
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
}

const pushProjGql = gql`
  mutation ($proj: ProjectInput!) {
    pushProject(proj: $proj)
  }
`;

const archiveProjGql = gql`
  mutation ($id: ID!) {
    archiveProject(id: $id)
  }
`;

const deleteProjGql = gql`
  mutation ($id: ID!) {
    deleteProject(id: $id)
  }
`;

export function useProjStatus() {
  const isAdmin = history?.location.pathname.split('/').pop() === 'allEdit' ? true : false;
  const queryGql = getGql( isAdmin ? 'superProjs' : 'iLeadProjs' )
  const [archive, setArchive] = useState('0');
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryProjectArgs>(queryGql, {
    variables: {
      isArchive: archive === '1' ? true : false
    },
    fetchPolicy: 'no-cache',
  });

  const [archiveProjHandle, { loading: archiveLoading }] = useMutation<Mutation, MutationDeleteProjectArgs>(
    archiveProjGql
  );
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

  const tmpProjs = ((isAdmin ?  queryData?.superProjs : queryData?.iLeadProjs) || []).map(item => {
    return { ...item }
  });
  const projs = projectClassify(R.filter(el => buildProjName(el.id, el.name).indexOf(filter) > -1, tmpProjs))
  const todoProjs = filterTodoProject(projs).filter(el => {
    return buildProjName(el.id, el.name).indexOf(filter) > -1
  })
  // projs
  const subordinates = queryData?.subordinates || [];
  const customers = queryData?.customers || [];
  const agreements = queryData?.agreements || [];
  const projectAgreements = queryData?.projectAgreements || [];

  const archiveProj = useCallback(
    async (id: string) => {
      await archiveProjHandle({ variables: { id } });
      refresh();
    },
    [archiveProjHandle, refresh],
  );

  const deleteProj = useCallback(
    async (id: string) => {
      await deleteProjHandle({ variables: { id } });
      refresh();
    },
    [deleteProjHandle, refresh],
  );

  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      let reqProj = await attachmentUpload(proj, buildProjName)
      await pushCostHandle({
        variables: {
          proj: reqProj
        },
      });
      refresh();
    },
    [pushCostHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading || archiveLoading,
    projs,
    todoProjs,
    subordinates,
    customers,
    agreements,
    projectAgreements,
    filter,
    archive,
    setArchive,
    setFilter,
    refresh,
    archiveProj,
    deleteProj,
    pushProj,
  };
}
