import type {
  Mutation,
  MutationDeleteAgreementArgs,
  MutationPushAgreementArgs,
  MutationContractPaymentArgs,
  AgreementInput,
  ContractPaymentInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
// import { agreementType } from '@/pages/utils/hook';
import moment from 'moment';
const queryGql = gql`
  query (
    $customersPageSize: Int
    $pageSizeAgreements: Int
    $name: String
    $customer: [String]
    $type: [String]
    $actualQuarter:[String]
    $expectedQuarter:[String]
    $payState:[String]
    $group:[String]
    $agreementPageSize:Int
    $regions:[String]
    $regionones:[String]
  ) {
    projectAgreements {
      id
      agreementId
    }
    subordinates {
      id
      name
    }
    projs {
      id
      name
    }
    customers(pageSize: $customersPageSize) {
      result {
        id
        name
      }
      total
      page
    }
    collectionQuarterManages {
      name
      code
      enable
    }

    contractPaymentManages(
      pageSize: $pageSizeAgreements
      name: $name
      customer: $customer
      type: $type
      actualQuarter:$actualQuarter
      expectedQuarter:$expectedQuarter
      payState:$payState
      group:$group
      regions:$regions
      regionones:$regionones
    ) {
      result {
        id
        name
        customer
        type
        fileList {
          uid
          name
          status
          url
        }
        contractSignDate
        contractPeriod
        contractId
        contractNumber
        contractAmount
        afterTaxAmount
        maintenanceFreePeriod
        remark
        createDate
        isDel
        payWayName
        milestoneName
        milestoneValue
        milestone {
          name
          value
        }
        payState
        expectedQuarter
        actualQuarter
        actualDate
        paymentRemark
        paymentFileList {
          uid
          name
          status
          url
        }
      }
      page
      total
    }
      payStateManages{
        name
        code
        enable
      }
      agreements(pageSize:$agreementPageSize){
      result{
        id
        name
        customer
        contractAmount
        contractSignDate
      }
    }
    regionones{
          id
          code
          name
          enable
        }
      regions{
      id
      code
      name
      enable
      parentId
    }
  }
`;

const pushAgreementGql = gql`
  mutation ($agreement: AgreementInput!) {
    pushAgreement(agreement: $agreement)
  }
`;
const contractPaymentGql = gql`
  mutation ($agreement: ContractPaymentInput!) {
    contractPaymentSub(agreement: $agreement)
  }
`;
const payWaySubGql = gql`
  mutation ($agreement: PayWayInput!) {
    payWaySub(agreement: $agreement)
  }
`;

const deleteAgreementGql = gql`
  mutation ($id: ID!) {
    deleteContractPayment(id: $id)
  }
`;

async function attachmentUpload(agreement: AgreementInput) {
  const formData = new FormData();
  // 临时变量
  let fileArr: any = [];
  // 拼接附件存储路径
  formData.append('directory', `/${agreement.id}/${agreement.contractAmount}/${agreement.name}_`);
  agreement?.paymentFileList?.forEach((file: any) => {
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
  agreement?.paymentFileList?.forEach((item: any) => {
    delete item.originFileObj;
    let sameId = fileArr.find((chItem: any) => chItem.uid === item.uid);
    if (sameId) {
      item.url = sameId.path;
    }
  });
  return agreement;
}

export function useAgreementState() {
  let [query, setQuery] = useState({});
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
    variables: {
      customersPageSize: 10000000,
      pageSizeAgreements: 10000000,
      agreementPageSize:100000000,
      ...query,
    },
  });
  useEffect(() => {
    refresh();
  }, [query]);
  const [deleteAgreementHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteAgreementArgs
  >(deleteAgreementGql);
  const [pushAgreementHandle, { loading: pushLoading }] = useMutation<
    Mutation,
    MutationPushAgreementArgs
  >(pushAgreementGql);
  //
  const [contractPaymentSubSubHandle, { loading: contractPaymentLoading }] = useMutation<
    Mutation,
    MutationContractPaymentArgs
  >(contractPaymentGql);
  const [payWaySubHandle, { loading: payWaySubLoading }] = useMutation<
    Mutation,
    MutationPushAgreementArgs
  >(payWaySubGql);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const agreements = queryData?.contractPaymentManages.result || [];
  const subordinates = queryData?.subordinates || [];
  const customers = queryData?.customers.result || [];
  const projs = queryData?.projs || [];
  const projectAgreements = queryData?.projectAgreements || [];

  const deleteAgreement = useCallback(
    async (id: string) => {
      await deleteAgreementHandle({ variables: { id } });
      refresh();
    },
    [deleteAgreementHandle, refresh],
  );
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
    [pushAgreementHandle, refresh],
  );
  const payWaySub = useCallback(
    async (agreement: ContractPaymentInput) => {
      let reqAgreement = await attachmentUpload(agreement);
      if(!reqAgreement.actualDate){
        reqAgreement.actualDate = ''
      }
      
        console.log(reqAgreement,'reqAgreement LLLLLL')
      await contractPaymentSubSubHandle({
        variables: {
          agreement: { ...reqAgreement },
        },
      });
      await refresh();
    },
    [payWaySubHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading || contractPaymentLoading || payWaySubLoading,
    agreements,
    subordinates,
    customers,
    projs,
    projectAgreements,
    agreements_:queryData?.agreements || [],
    refresh,
    deleteAgreement,
    pushAgreement,
    query,
    setQuery,
    payWaySub,
    collectionQuarterManages:queryData?.collectionQuarterManages,
    payStateManages:queryData?.payStateManages,
    regionones:queryData?.regionones || [],
    regions:queryData?.regions || [],
  };
}
