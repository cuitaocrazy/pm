import type {
  AgreementInput,
  Mutation,
  MutationDeleteProjectArgs,
  MutationPushAgreementArgs,
  MutationPushProjectArgs,
  ProjectInput,
  Query,
  QueryProjectArgs,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { agreementType, useBaseState } from '@/pages/utils/hook';
import { useModel } from 'umi';
import * as R from 'ramda';
import { projectClassify } from './utils';
import axios from 'axios';
import { client } from '@/apollo';

const queryGql = gql`
  query (
    $isArchive: Boolean
    $industries: [String]
    $regions: [String]
    $projTypes: [String]
    $page: Int
    $confirmYear: String
    $group: String
    $status: String
    $name: String
    $pageSize: Int
    $pageAgreements: Int
    $pageSizeAgreements: Int
  ) {
    subordinates {
      id
      name
    }
    agreements(page: $pageAgreements, pageSize: $pageSizeAgreements) {
      result {
        id
        name
      }
      total
      page
    }
    projectAgreements {
      id
      agreementId
    }
    customers(pageSize: $pageSize) {
      result {
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
      total
      page
    }
    superProjs(
      isArchive: $isArchive
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
const getArgById = gql`
  query ($id: String) {
    getAgreementsByProjectId(id: $id) {
      id
      name
      customer
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
const pushAgreementGql = gql`
  mutation ($agreement: AgreementInput!) {
    pushAgreement(agreement: $agreement)
  }
`;

export function useProjStatus() {
  const [archive, setArchive] = useState(false);
  let [query, setQuery] = useState({ page: 1, pageSize: 10000000,});
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryProjectArgs
  >(queryGql, {
    variables: {
      isArchive: archive,
      ...query,
      pageAgreements: 1,
      pageSizeAgreements: 10000000,
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

  const { refresh: initialRefresh, initialState } = useModel('@@initialState');
  const { buildProjName } = useBaseState();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    refresh();
    initialRefresh();
  }, [refresh, query]);
  const tmpProjs = queryData?.superProjs.result || [];

  const projs = projectClassify(
    R.filter((el) => buildProjName(el.id, el.name).indexOf(filter) > -1, tmpProjs),
  );
  const subordinates = queryData?.subordinates || [];
  const customers = queryData?.customers.result || [];
  const agreements = queryData?.agreements.result || [];
  const projectAgreements = queryData?.projectAgreements || [];
  const deleteProj = useCallback(
    async (id: string) => {

      refresh();
    },
    [deleteProjHandle, refresh],
  );

  const pushProj = useCallback(
    async (proj: ProjectInput) => {

      refresh();
    },
    [pushCostHandle, refresh],
  );
//zhouyueyang===
const [pushAgreementHandle, { loading: pushLoading1 }] = useMutation<
    Mutation,
    MutationPushAgreementArgs
  >(pushAgreementGql);
  const getArgByProId = async (proId:string) => {
    return await client.query({
      query: getArgById,
      fetchPolicy: 'no-cache',
      variables: { id: proId },
    });
  };

  const pushAgreement = useCallback(
    async (agreement: AgreementInput) => {
      let reqAgreement = await attachmentUpload(agreement);
      delete reqAgreement.time;
      delete reqAgreement.customerName;
      await pushAgreementHandle({
        variables: {
          agreement: reqAgreement,
        },
      });
      refresh();
    },
    [pushAgreementHandle],
  );
//zhouyueyang===
  return {
    loading: queryLoading || deleteLoading || pushLoading || pushLoading1,
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
    total: queryData?.superProjs?.total,
    setQuery,
    query,
    access: initialState?.currentUser?.access,
    pushAgreement,
    getArgByProId,
  };
}
async function attachmentUpload(agreement: AgreementInput) {
  const formData = new FormData();
  // 临时变量
  let fileArr: any = [];
  // 拼接附件存储路径
  formData.append(
    'directory',
    `/${agreement.customerName}/${agreementType[agreement.type]}/${agreement.name}_`,
  );
  agreement?.fileList?.forEach((file: any) => {
    if (file.originFileObj) {
      formData.append('uids[]', file.uid);
      formData.append('files', file.originFileObj);
      fileArr.push(file.originFileObj);
    }
  });
  // 批量上传附件
  if (fileArr.length) {
    let { data } = await axios.post('/api/upload/agreement', formData);
    if (data.code === 1000) {
      fileArr = data.data;
    }
    // else {
    //   message.warning('附件存储失败');
    //   return new Promise ((resolve, reject) => {})
    // }
  }
  agreement?.fileList?.forEach((item: any) => {
    delete item.originFileObj;
    let sameId = fileArr.find((chItem: any) => chItem.uid === item.uid);
    if (sameId) {
      item.url = sameId.path;
    }
  });
  return agreement;
}
