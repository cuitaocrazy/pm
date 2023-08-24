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
import { useModel } from 'umi';
import axios from 'axios';

const queryGql = gql`
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
    projs(isArchive: $isArchive){
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

// 数据转树型并且扁平化
function convert(data: any[]) {
  let result:any[] = [];
  let map = {};
  data.forEach(item => {
      map[item.id] = item;
  });
  data.forEach(item => {
      // item.pid 为null时 返回underfined
      let parent = map[item.pId];
      if (parent) {
        (parent.children || (parent.children = [])).push(item);
      } else {
          // 这里push的item是pid为null的数据
          result.push(item);
      }
  });
  result = flat(result).map((el: any) => {
    el.hasChildren = el.children ? true : false
    delete el.children
    return el
  })
  return result;
}

function flat(source: any[]) {
  let res: any = []
  source.forEach(el=>{
      res.push(el)
      el.children && res.push(...flat(el.children))
  })
  return res
}
// 附件上传
async function attachmentUpload (proj: ProjectInput, buildProjName: any) {
  for (let [index, act] of (proj.actives || []).entries()) {
    const formData = new FormData();
    // 临时变量
    let fileArr:any = []
    // 拼接附件存储路径
    formData.append('directory',`/${buildProjName(proj.id, proj.name)}/${index}/`);
    act.fileList?.forEach((file: any) => {
      if (file.originFileObj) {
        formData.append('uids[]', file.uid);
        formData.append('files', file.originFileObj);
        fileArr.push(file.originFileObj)
      }
    });
    // 批量上传附件
    if (fileArr.length) {
      let { data } = await axios.post('/api/upload/active', formData)
      if (data.code === 1000) {
        fileArr = data.data
      }
    }
    act?.fileList?.forEach((item: any) => {
      delete item.originFileObj
      let sameId = fileArr.find((chItem: any) => chItem.uid === item.uid)
      if (sameId) {
        item.url = sameId.path
      }
    })
  }
  return proj
}

export function useProjStatus() {
  const [archive, setArchive] = useState(false);
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryProjectArgs>(queryGql, {
    variables: {
      isArchive: archive
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

  const { refresh: initialRefresh } = useModel('@@initialState');
  const { buildProjName } = useBaseState();
  const [filter, setFilter] = useState('');
    
  useEffect(() => {
    refresh();
    initialRefresh()
  }, [refresh]);
  const tmpProjs = queryData?.projs || [];
  const projs = convert(tmpProjs).filter(el => {
    return buildProjName(el.id, el.name).indexOf(filter) > -1
  })
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
    loading: queryLoading || deleteLoading || pushLoading || archiveLoading,
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
    archiveProj,
    deleteProj,
    pushProj,
  };
}
