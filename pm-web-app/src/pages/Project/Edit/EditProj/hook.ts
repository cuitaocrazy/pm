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
import { attachmentUpload, filterTodoProject, formatDailiesDate, projectClassify } from './utils';

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
      allProjDaily {
        project {
          id
        }
        dailies {
          date
          dailyItems {
            employee {
              id
              name
            }
            timeConsuming
            content
          }
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
const restartProjGql = gql`
  mutation ($id: ID!) {
    restartProject(id: $id)
  }
`;


export function useProjStatus() {
  const isAdmin = history?.location.pathname.split('/').pop() === 'allEdit' ? true : false;
  const queryGql = getGql( isAdmin ? 'projs' : 'iLeadProjs' )
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
  const [restartProjHandle, { loading: restartLoading }] = useMutation<Mutation, MutationDeleteProjectArgs>(
    restartProjGql
  );

  const { refresh: initialRefresh } = useModel('@@initialState');
  const { buildProjName } = useBaseState();
  const [filter, setFilter] = useState('');
    
  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);

  const allProjDaily = formatDailiesDate(queryData?.allProjDaily || [])
  // console.log(allProjDaily)
  const tmpProjs = ((isAdmin ?  queryData?.projs : queryData?.iLeadProjs) || []).map(item => {
    const dailieObj = allProjDaily.find(all => all.project.id === item.id) || {}
    return { ...item, ...dailieObj }
  });
  const projs = projectClassify(R.filter(el => buildProjName(el.id, el.name).indexOf(filter) > -1, tmpProjs))
  // console.log(projs)
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

  const restartProj = useCallback(
    async (id: string) => {
      await restartProjHandle({ variables: { id } });
      refresh();
    },
    [restartProjHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading || archiveLoading || restartLoading,
    allProjDaily,
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
    restartProj,
    pushProj,
  };
}
