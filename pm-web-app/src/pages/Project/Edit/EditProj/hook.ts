import type {
  Mutation,
  MutationDeleteProjectArgs,
  MutationPushProjectArgs,
  ProjectInput,
  Query,
  QueryProjectArgs,
  MutationPrintProjArgs,
} from '@/apollo';
import { client } from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useBaseState } from '@/pages/utils/hook';
import { useModel, history } from 'umi';
import * as R from 'ramda';
import { attachmentUpload, projectClassify } from './utils';
import {
  Modal,
} from 'antd';



const getGql = (proName: string) => {
  return gql`
    query ($isArchive: Boolean,$industries: [String],$regions:[String],$projTypes:[String],$page:Int,$pageSize:Int,$confirmYear:String,$group:String,$status:String,$name:String,$agreementPageSize:Int,$contractState:String,$isPrint:String) {
      subordinates {
        id
        name
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
      projectAgreements {
        id
        agreementId
      }
        yearManages{
          code
          name
          enable
        }
          me {
            id
            name
            access
            groups
          }

      ${proName}(isArchive: $isArchive,industries:$industries,regions:$regions,projTypes:$projTypes,page:$page,pageSize:$pageSize,confirmYear:$confirmYear,group:$group,status:$status,name:$name,contractState:$contractState,isPrint:$isPrint){
        result{
          id
        pId
        printState
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
        confirmQuarter
        doYear
        projectClass
        group
        proState
        oldId
        reason
        contractAmount
        recoAmount
        afterTaxAmount
        productDate
        contractSignDate
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
          contractAmount
          afterTaxAmount
          contractSignDate
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
    $contractState:String
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
      contractState:$contractState
    ) {
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
        confirmQuarter
        doYear
        projectClass
        group
        proState
        oldId
        reason
        contractAmount
        recoAmount
        afterTaxAmount
        productDate
        contractSignDate
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
          contractAmount
          afterTaxAmount
          contractSignDate
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
      todoTotal
    }
  }
`;
const pushProjGql = gql`
  mutation ($proj: ProjectInput!) {
    pushProject(proj: $proj)
  }
`;
const applyAgainGql = gql`
  mutation ($proj: ProjectInput!) {
    applyAgain(proj: $proj)
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

const printProjGql = gql`
  mutation ($proj:PrintProjInput) {
    printProject(proj:$proj)
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
  const [refresh1, { loading: queryLoading1, data: queryData1 }] = useLazyQuery<
    Query,
    QueryProjectArgs
  >(queryGql, {
    variables: {
      isArchive: archive === '1' ? true : false, //1：归档，0:项目，2:代办项目
      agreementPageSize: 10000000,
      ...query,
      pageSize:100000000,
      page:1,
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
  //printProjGql
  const [printProjHandle, { loading: printProjLoading }] = useMutation<Mutation, MutationPrintProjArgs>(
    printProjGql,
  );
  const [applyAgain, { loading: applyAgainLoading }] = useMutation<
    Mutation,
    MutationPushProjectArgs
  >(applyAgainGql);

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
  const tmpProjs = (
    (isAdmin ? queryData?.superProjs?.result : queryData?.iLeadProjs?.result) || []
  ).map((item) => {
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
  const printProj = useCallback(async (printProj: Object)=>{
    console.log(printProj.id,'MMMM')
    const content = document.getElementById('printContent').innerHTML;
            const iframe = document.getElementById('print-frame');
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(content);
            iframe.contentWindow.document.close();
            iframe.contentWindow.addEventListener('afterprint', async() => {
              console.log('打印预览已关闭');
              Modal.confirm({
                title: '提示',
                content: '是否真的打印？',
                okText: '确认',
                cancelText: '取消',
                onOk: async() => {
                  console.log('用户点击了确认');
                  // 在这里添加确认后的逻辑，比如调用打印函数 
                  await printProjHandle({
                    variables: {
                      proj: {id:printProj.id,printState:'1'},
                    },
                  })
                  await refresh()
                },
                onCancel: async() => {
                  console.log('用户点击了取消');
                  // 在这里添加取消后的逻辑
                  await printProjHandle({
                    variables: {
                      proj: {id:printProj.id,printState:'0'},
                    },
                  })
                  await refresh()
                }
              });
              
            });
            // 调用iframe中的print方法进行打印
            iframe.contentWindow.print();
  },[refresh])

  const pushProj = useCallback(
    async (proj: ProjectInput) => {
      let temp = JSON.parse(JSON.stringify(proj));
      const groupPath =
        temp.group &&
        (typeof temp.group === 'string'
          ? temp.group
          : temp.group.length > 0
          ? temp.group?.reduce((accumulator: string, currentValue: string) => {
              return `${accumulator}/${currentValue}`;
            }, '')
          : '');
      let reqProj = await attachmentUpload({ ...proj, group: groupPath }, buildProjName);
      if(reqProj.contractState){
        reqProj.contractState =
        reqProj.contractState1 == '未签署' ? 0 : reqProj.contractState1 == '已签署' ? 1 : '';
      }
      delete reqProj.proState1;
      delete reqProj.contractState1;
      delete reqProj.contAmount_
      delete reqProj.taxAmount_
      delete reqProj.serviceCycle_
      console.log(reqProj,'reqProj MMMMMM')
      if (proj.proState == 1 || !proj.proState || proj.proState == null) {
        await pushCostHandle({
          variables: {
            proj: reqProj,
          },
        });
      } else if (proj.proState == 2) {
        
        reqProj.proState = 0;
        await applyAgain({
          variables: {
            proj: reqProj,
          },
        });
      }
      getTodoList(query).then((res) => {
        setTodoProjs(res.data.iLeadTodoProjs);
      });
      refresh();
    },
    [pushCostHandle, refresh],
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
    loading: queryLoading || deleteLoading || pushLoading || archiveLoading,
    projs,
    todoProjs: todoProjs.result,
    subordinates,
    subordinates_:queryData?.subordinates,
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
    // yearManages: queryData?.yearManages,
    yearManages: queryData?.yearManages,
    total: isAdmin
      ? queryData?.superProjs?.total
      : archive !== '2'
      ? queryData?.iLeadProjs?.total
      : todoProjs.total,
    setQuery,
    query,
    getTodoList,
    todoProjsTotal,
    printProj,
    me:queryData?.me,
  };
}
