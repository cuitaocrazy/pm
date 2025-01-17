import type {
  Mutation,
  MutationDeleteProjectArgs,
  MutationPushProjectArgs,
  ProjectInput,
  Query,
  QueryFilterProjectArgs,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useBaseState } from '@/pages/utils/hook';
import { useModel, history } from 'umi';
import { attachmentUpload } from './utils';

const queryGql = gql`
  query (
    $projType: String!
    $industries: [String]
    $regions: [String]
    $page: Int
    $pageSize:Int
    $confirmYear: String
    $group: String
    $status: String
    $name: String
    $agreementPageSize:Int
  ) {
    projectAgreements {
      id
      agreementId
    }
      agreements(pageSize:$agreementPageSize) {
      result{
        id
        name
        contractAmount
        afterTaxAmount
        maintenanceFreePeriod
        contractSignDate
      }
    }
    yearManages {
      code
      name
      enable
    }
    filterProjs(
      projType: $projType
      industries: $industries
      regions: $regions
      page: $page
      pageSize:$pageSize
      confirmYear: $confirmYear
      group: $group
      status: $status
      name: $name
    ) {
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
        agreements {
          id
          name
          id
          name
          type
          remark
          fileList {
            uid
            name
            status
            url
          }
          startTime
          endTime
          isDel
          createDate
          contractSignDate
          contractPeriod
        }
        customerObj {
          id
          name
          createDate
          enable
          industryCode
          isDel
          regionCode
          remark
          salesman
          contacts {
            name
            phone
            tags
          }
        }
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
  const [routeProjType] = useState(
    history?.location.pathname.split('/').pop() === 'editSalesActive' ? 'SQ' : 'SH',
  );
  let [query, setQuery] = useState({});
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryFilterProjectArgs
  >(queryGql, {
    variables: {
      projType: routeProjType,
      pageSize: 10000,
      agreementPageSize:10000000,
      ...query,
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

  const { refresh: initialRefresh } = useModel('@@initialState');
  const { buildProjName } = useBaseState();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    refresh();
    initialRefresh();
  }, [refresh, query]);

  const projectAgreements = queryData?.projectAgreements || [];
  const agreements = queryData?.agreements || [];
  const total = queryData?.filterProjs.total || undefined;
  const tmpProjsResult = queryData?.filterProjs.result || [];
  const deleteProj = useCallback(
    async (id: string) => {
      await deleteProjHandle({ variables: { id } });
      refresh();
    },
    [deleteProjHandle, refresh],
  );

  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      if (proj.status === 'endProj') {
        return;
      }
      let reqProj = await attachmentUpload(proj, buildProjName);
      await pushCostHandle({
        variables: {
          proj: reqProj,
        },
      });
      refresh();
    },
    [pushCostHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    projectAgreements,
    agreements,
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
    yearManages:queryData?.yearManages
  };
}
