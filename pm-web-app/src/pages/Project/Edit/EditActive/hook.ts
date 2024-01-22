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
import { useModel, history } from 'umi';
import {  attachmentUpload } from './utils';

const queryGql = gql`
query ($projType: String!$industries: [String],$regions:[String],$page:Int,$confirmYear:String,$group:String,$status:String,$name:String,$pageSize:Int) {
    subordinates {
      id
      name
    }
    agreements {
      result {
        id
        name
      }
      page
      total
    }
    projectAgreements {
      id
      agreementId
    }
    customers(pageSize:$pageSize) {
      result{
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
      page
      total
    }
    filterProjs(projType:$projType, industries:$industries, regions:$regions, page:$page,confirmYear:$confirmYear, group:$group, status:$status, name:$name) {
      result {
        id
        pId
        name
        contName
        customer
        leader
        group
        confirmYear
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
        humanFee
        projectFee
        actualCost
        taxAmount
        description
        createDate
        updateTime
        participants
        status
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
      page
      total
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
  const [routeProjType] = useState(history?.location.pathname.split('/').pop() === 'editSalesActive' ? 'SQ' : 'SH');
  let [query, setQuery] = useState({});
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryFilterProjectArgs>(queryGql, {
    variables: {
      projType: routeProjType,
      pageSize: 10000,
      ...query,
    },
    fetchPolicy: 'no-cache',
  });
  console.log(queryData)
  const [deleteProjHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteProjectArgs
  >(deleteProjGql);
  const [pushCostHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushProjectArgs>(
    pushProjGql,
  );

  const { refresh: initialRefresh } = useModel('@@initialState');
  const { buildProjName } = useBaseState();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh, query]);

  const tmpProjs = queryData?.filterProjs || {};
  const subordinates = queryData?.subordinates || [];
  const customers = queryData?.customers.result || [];
  const agreements = queryData?.agreements.result || [];
  const projectAgreements = queryData?.projectAgreements || [];
  const total = queryData?.filterProjs.total || undefined;
  const tmpProjsResult = queryData?.filterProjs.result || []
  console.log(total)

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
    loading: queryLoading || deleteLoading || pushLoading,
    tmpProjs,
    subordinates,
    customers,
    agreements,
    projectAgreements,
    filter,
    routeProjType,
    setFilter,
    refresh,
    deleteProj,
    pushProj,
    total,
    setQuery,
    tmpProjsResult,
    query,
  };
}
