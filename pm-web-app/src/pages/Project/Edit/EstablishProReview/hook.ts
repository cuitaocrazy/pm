import type {
  Mutation,
  MutationDeleteProjectArgs,
  MutationPushProjectArgs,
  MutationCheckProjArgs,
  ProjectInput,
  Query,
  QueryProjectArgs,
} from '@/apollo';
import { client } from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useBaseState } from '@/pages/utils/hook';
import { useModel, history } from 'umi';
import * as R from 'ramda';
import { attachmentUpload, projectClassify } from './utils';

const getGql = (proName: string) => {
  return gql`
    query ($isArchive: Boolean,$industries: [String],$regions:[String],$projTypes:[String],$page:Int,$pageSize:Int,$confirmYear:String,$group:String,$status:String,$name:String,$agreementPageSize:Int) {
      subordinates {
        id
        name
      }
      agreements(pageSize:$agreementPageSize) {
      result{
        id
        name
      }
    }
      projectAgreements {
        id
        agreementId
      }
         yearManages {
      code
      name
      enable
    }

      ${proName}(isArchive: $isArchive,industries:$industries,regions:$regions,projTypes:$projTypes,page:$page,pageSize:$pageSize,confirmYear:$confirmYear,group:$group,status:$status,name:$name){
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
        proState
        contractState
        productName
        copyrightName
        projectArrangement
        address
        customerContact
        contactDetailsCus
        salesManager
        copyrightNameSale
        merchantContact
        contactDetailsMerchant
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
        customerObj{
          id
          name
          industryCode
          regionCode
          salesman
          contacts{
            name
            phone
            tags
            recorder
            remark
          }
          officeAddress
          enable
          remark
          isDel
          createDate
        }
        }
        page
        total
      }
      realSubordinates{
        id
        name
        enabled
      }
    }
  `;
};
const queryTodoProjs = gql`
  query (
    $isArchiveTodo: Boolean
    $industries: [String]
    $regions: [String]
    $projTypes: [String]
    $page: Int
    $confirmYear: String
    $group: String
    $status: String
    $name: String
  ) {
    iLeadTodoProjs(
      isArchive: $isArchiveTodo
      industries: $industries
      regions: $regions
      projTypes: $projTypes
      page: $page
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
        agreements {
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
        customerObj {
          id
          name
          industryCode
          regionCode
          salesman
          contacts {
            name
            phone
            tags
            recorder
            remark
          }
          officeAddress
          enable
          remark
          isDel
          createDate
        }
      }
      page
      total
      todoTotal
    }
  }
`;
const pushProjGql = gql`
  mutation ($proj: ProjectInput!) {
    pushProject(proj: $proj)
  }
`;
const checkProjGql = gql`
  mutation ($id: String, $checkState: Int, $reason: String, $incomeConfirm: String,$printState:String) {
    checkProj(id: $id, checkState: $checkState, reason: $reason, incomeConfirm: $incomeConfirm,printState:$printState)
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
  const queryGql = getGql('awaitingReviewProjs'); //全部项目走superProjs，项目维护走iLeadProjs
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
  //checkProjHandle
  const [checkProjHandle, { loading: checkProjHandleLoading }] = useMutation<
    Mutation,
    MutationCheckProjArgs
  >(checkProjGql);

  const { refresh: initialRefresh } = useModel('@@initialState'); //获取全局初始状态
  const { buildProjName } = useBaseState(); //项目名字的工具函数
  const [filter, setFilter] = useState('');
  const [todoProjs, setTodoProjs] = useState<any>({});
  useEffect(() => {
    initialRefresh();
    if (archive === '2') {
      getTodoList(query).then((res) => {
        setTodoProjs(res.data.iLeadTodoProjs);
      });
    } else {
      refresh();
    }
  }, [refresh, query, archive]);
  const tmpProjs = (queryData?.awaitingReviewProjs?.result || []).map((item) => {
    return { ...item };
  });
  const projs = projectClassify(
    R.filter((el) => buildProjName(el.id, el.name).indexOf(filter) > -1, tmpProjs),
  );
  // projs
  const subordinates = queryData?.realSubordinates || []; //realSubordinates拿到同部门及以下的人员
  const agreements = queryData?.agreements || [];
  // const agreements = isAdmin ? queryData?.superProjs?.result.agreenemts : queryData?.iLeadProjs?.result.agreenemts
  // const agreements = tmpProjs
  const projectAgreements = queryData?.projectAgreements || [];

  const archiveProj = useCallback(
    async (id: string) => {
      await archiveProjHandle({ variables: { id } });
      refresh();
      getTodoList(query).then((res) => {
        setTodoProjs(res.data.iLeadTodoProjs);
      });
    },
    [archiveProjHandle, refresh],
  );

  const deleteProj = useCallback(
    async (id: string) => {
      await deleteProjHandle({ variables: { id } });
      refresh();
      getTodoList(query).then((res) => {
        setTodoProjs(res.data.iLeadTodoProjs);
      });
    },
    [deleteProjHandle, refresh],
  );

  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      
      // let temp = JSON.parse(JSON.stringify(proj));
      // const groupPath =
      //   temp.group &&
      //   (typeof temp.group === 'string'
      //     ? temp.group
      //     : temp.group.length > 0
      //     ? temp.group?.reduce((accumulator: string, currentValue: string) => {
      //         return `${accumulator}/${currentValue}`;
      //       }, '')
      //     : '');
      // let reqProj = await attachmentUpload({ ...proj, group: groupPath }, buildProjName);
      // await pushCostHandle({
      //   variables: {
      //     proj: reqProj,
      //   },
      // });
      // getTodoList(query).then((res) => {
      //   setTodoProjs(res.data.iLeadTodoProjs);
      // });
      // refresh();
    },
    [pushCostHandle, refresh],
  );
  //审核项目
  const checkProj = useCallback(
    async (proj: ProjectInput) => {
      let { id, checkState, reason } = proj;
      let obj = {
        id,
        checkState,
        reason,
      };
      if (proj.checkState == 1) {
        obj.printState = '0'
        obj.incomeConfirm = '0';
      }
      await checkProjHandle({
        variables: {
          ...obj,
        },
      });
      await refresh();
    },
    [checkProjHandle, refresh],
  );
  //获取代办项目
  const getTodoList = async (params: any) => {
    return await client.query({
      query: queryTodoProjs,
      fetchPolicy: 'no-cache',
      variables: { isArchiveTodo: false, ...params },
    });
  };
  let [todoProjsTotal, setTodoProjsTotal] = useState(0);
  useEffect(() => {
    if (!isAdmin) {
      getTodoList({ page: 1 }).then((res) => {
        setTodoProjsTotal(res.data.iLeadTodoProjs.todoTotal);
      });
    }
  });

  return {
    loading:
      queryLoading || deleteLoading || pushLoading || archiveLoading || checkProjHandleLoading,
    projs,
    todoProjs: todoProjs.result,
    subordinates,
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
    checkProj,
    total: queryData?.awaitingReviewProjs?.total,
    setQuery,
    query,
    getTodoList,
    todoProjsTotal,
    yearManages: queryData?.yearManages,
  };
}
