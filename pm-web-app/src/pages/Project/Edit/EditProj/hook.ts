import type {
  Mutation,
  MutationDeleteProjectArgs,
  MutationPushProjectArgs,
  ProjectInput,
  Query,
  QueryProjectArgs,
  CustomersResult
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useBaseState } from '@/pages/utils/hook';
import { useModel, history } from 'umi';
import * as R from 'ramda';
import { attachmentUpload, filterTodoProject, projectClassify } from './utils';

const getGql = (proName: string) => {
  return gql`
    query ($isArchive: Boolean,$industries: [String],$regions:[String],$projTypes:[String],$page:Int,$confirmYear:String,$group:String,$status:String,$name:String,$agreementPageSize:Int) {
      subordinates {
        id
        name
      }
      agreements(pageSize:$agreementPageSize) {
      result{
        id
        name
        type
      }
      page
      total
    }
      projectAgreements {
        id
        agreementId
      }

      ${proName}(isArchive: $isArchive,industries:$industries,regions:$regions,projTypes:$projTypes,page:$page,confirmYear:$confirmYear,group:$group,status:$status,name:$name){
        result{
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
        projectClass
        group
        agreements{
          id
          name
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
};

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
  const isAdmin = history?.location.pathname.split('/').pop() === 'allEdit' ? true : false; //判断是全部项目还是项目维护
  const queryGql = getGql(isAdmin ? 'superProjs' : 'iLeadProjs'); //全部项目走superProjs，项目维护走iLeadProjs
  const [archive, setArchive] = useState('0');
  let [query, setQuery] = useState({});
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryProjectArgs
  >(queryGql, {
    variables: {
      isArchive: archive === '1' ? true : false, //1：归档，0:项目，2:代办项目
      agreementPageSize: 10000000,
      ...query,
    },
    fetchPolicy: 'no-cache',
  }); //走后台获取数据，data为返回数据，refresh为函数，自己触发，variables为参数
  const [archiveProjHandle, { loading: archiveLoading }] = useMutation<
    Mutation,
    MutationDeleteProjectArgs
  >(archiveProjGql);
  const [deleteProjHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteProjectArgs
  >(deleteProjGql);
  const [pushCostHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushProjectArgs>(
    pushProjGql,
  );

  const { refresh: initialRefresh } = useModel('@@initialState'); //获取全局初始状态
  const { buildProjName } = useBaseState(); //项目名字的工具函数
  const [filter, setFilter] = useState('');

  useEffect(() => {
    initialRefresh();
    refresh();
  }, [refresh, query]);

  const tmpProjs = (
    (isAdmin ? queryData?.superProjs?.result : queryData?.iLeadProjs?.result) || []
  ).map((item) => {
    return { ...item };
  });
  const projs = projectClassify(
    R.filter((el) => buildProjName(el.id, el.name).indexOf(filter) > -1, tmpProjs),
  );
  const todoProjs = filterTodoProject(projs).filter((el) => {
    return buildProjName(el.id, el.name).indexOf(filter) > -1;
  });
  // projs
  const subordinates = queryData?.subordinates || [];
  const customers = queryData?.customers as CustomersResult || [];
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
    total: isAdmin ? queryData?.superProjs?.total : queryData?.iLeadProjs?.total,
    setQuery,
    query,
  };
}
