import type {
  Mutation,
  MutationDeleteProjectArgs,
  MutationPushProjectArgs,
  ProjectInput,
  Query,
  QueryFilterProjectArgs
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useBaseState } from '@/pages/utils/hook';
import { useModel } from 'umi';
import { convert, attachmentUpload } from './utils';

const queryGql = gql`
query ($projType: String!,$customersPageSize:Int,$pageSizeAgreements:Int) {
    subordinates {
      id
      name
    }
    agreements(pageSize:$pageSizeAgreements) {
      result{id
      name}
      total
      page
    }
    projectAgreements {
      id
      agreementId
    }
    customers(pageSize:$customersPageSize) {
      result{id
      name
      industryCode
      regionCode
      salesman
      enable
      contacts {
        name
        phone
        tags
      }}
      total
      page
    }
    filterProjsByType(projType: $projType) {
      id
      pId
      name
      contName
      customer
      leader
      salesLeader
      description
      createDate
      updateTime
      participants
      status
      startTime
      endTime
      timeConsuming
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
  const { refresh: initialRefresh, initialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.access?.includes('realm:supervisor')
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryFilterProjectArgs>(queryGql, {
    variables: {
      projType: 'ZH',
      customersPageSize:10000000,
      pageSizeAgreements:10000000
    },
    fetchPolicy: 'no-cache',
  });
  const [deleteProjHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteProjectArgs
  >(deleteProjGql);
  const [pushCostHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushProjectArgs>(
    pushProjGql,
  );

  const { buildProjName } = useBaseState();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);
  const tmpProjs = queryData?.filterProjsByType || [];
  const projs = convert(tmpProjs).filter(el => {
    return el.name.indexOf(filter) > -1
  })
  const subordinates = queryData?.subordinates || [];
  const customers = queryData?.customers.result || [];
  const agreements = queryData?.agreements.result || [];
  const projectAgreements = queryData?.projectAgreements || [];

  const deleteProj = useCallback(
    async (id: string) => {
      await deleteProjHandle({ variables: { id } });
      refresh();
    },
    [deleteProjHandle, refresh],
  );

  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      if (proj.status === 'endProj') { return }
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
    isAdmin,
    loading: queryLoading || deleteLoading || pushLoading,
    projs,
    subordinates,
    customers,
    agreements,
    projectAgreements,
    filter,
    setFilter,
    refresh,
    deleteProj,
    pushProj,
  };
}
