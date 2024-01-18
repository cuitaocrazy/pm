import type {
  Mutation,
  MutationDeleteAgreementArgs,
  MutationPushAgreementArgs,
  AgreementInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import axios from 'axios';
import { agreementType } from '@/pages/utils/hook';

const queryGql = gql`
  {
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
    customers {
      result{
        id
        name
      }
      total
      page
    }
    agreements {
      result{
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
      page
      total
    }
  }
`;

const pushAgreementGql = gql`
  mutation ($agreement: AgreementInput!) {
    pushAgreement(agreement: $agreement)
  }
`;

const deleteAgreementGql = gql`
  mutation ($id: ID!) {
    deleteAgreement(id: $id)
  }
`;

async function attachmentUpload(agreement: AgreementInput) {
  const formData = new FormData();
  // 临时变量
  let fileArr: any = []
  // 拼接附件存储路径
  formData.append('directory', `/${agreement.customerName}/${agreementType[agreement.type]}/${agreement.name}_`);
  agreement?.fileList?.forEach((file: any) => {
    if (file.originFileObj) {
      formData.append('uids[]', file.uid);
      formData.append('files', file.originFileObj);
      fileArr.push(file.originFileObj)
    }
  });
  // 批量上传附件
  if (fileArr.length) {
    let { data } = await axios.post('/api/upload/agreement', formData)
    if (data.code === 1000) {
      fileArr = data.data
    }
    // else {
    //   message.warning('附件存储失败');
    //   return new Promise ((resolve, reject) => {})
    // }
  }
  agreement?.fileList?.forEach((item: any) => {
    delete item.originFileObj
    let sameId = fileArr.find((chItem: any) => chItem.uid === item.uid)
    if (sameId) {
      item.url = sameId.path
    }
  })
  return agreement
}

export function useAgreementState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteAgreementHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteAgreementArgs
  >(deleteAgreementGql);
  const [pushAgreementHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushAgreementArgs>(
    pushAgreementGql,
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const agreements = queryData?.agreements.result || [];
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
      let reqAgreement = await attachmentUpload(agreement)
      delete reqAgreement.time
      delete reqAgreement.customerName
      await pushAgreementHandle({
        variables: {
          agreement: reqAgreement
        },
      })
      refresh()
    },
    [pushAgreementHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    agreements,
    subordinates,
    customers,
    projs,
    projectAgreements,
    refresh,
    deleteAgreement,
    pushAgreement,
  };
}
