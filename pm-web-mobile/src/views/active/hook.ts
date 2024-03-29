import type { Project, User, Query, QueryFilterProjectArgs, MutationPushProjectArgs } from '@/apollo';
import { ref, watch, inject, reactive } from 'vue';
import { useStore } from 'vuex';
import { useQuery, DefaultApolloClient } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { attachmentUpload } from '@/utils';

const queryGql = gql`
  query ($customerId: String, $org: String, $projType: String, $type: String, $isAdmin: Boolean) {
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
    filterProjsByApp (customerId: $customerId, org: $org, projType: $projType, type: $type, isAdmin: $isAdmin) {
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

export function useProjectState() {
  const store = useStore()
  const filter = reactive({
    customerId: '',
    org: '',
    projType: ''
  })
  const apolloClient: any = inject(DefaultApolloClient)
  const { onResult, refetch } = useQuery<Query, QueryFilterProjectArgs>(queryGql, {
    isAdmin: ['realm:supervisor'].filter(item => store.state.currentUser.me.access.includes(item)).length ? true : false,
    type: 'active',
    customerId: filter.customerId,
    org: filter.org,
    projType: filter.projType,
  }, { fetchPolicy: 'no-cache' });
  const projs = ref<Project[]>();
  const showProjs = ref();
  const subordinates = ref<User[]>([]);
  const otherData = ref();
  const customers = ref([]);
  const loading = ref(true);

  onResult((queryResult) => {
    if (queryResult.data) {
      projs.value = queryResult.data.filterProjsByApp || [];
      subordinates.value = queryResult?.data.subordinates || [];
      otherData.value = queryResult?.data || {}
      customers.value = queryResult?.data.customers || []
      loading.value = false
    }
  });

  watch([projs], ([projs]) => {
    const tempArr = JSON.parse(JSON.stringify(projs)) || []
    const tempProj = {}
    tempArr.forEach(item => {
      item.key = item.id + '-' + Number(new Date())
      if (tempProj[item.name]) {
        tempProj[item.name].push(item)
      } else {
        tempProj[item.name] = [item]
      }
    });
    showProjs.value = tempProj
  })

  const saveActive = async (newProj) => {
    const reqProj = await attachmentUpload(newProj)
    return new Promise((resolve, reject) => {
      const variables: MutationPushProjectArgs = {
        proj: reqProj,
      }
      apolloClient.mutate({
        mutation: pushProjGql,
        variables: variables 
      }).then((data: any) => {
        // 结果
        resolve('保存成功')
        refetch()
      }).catch((error: any) => {
        // 错误
        reject('保存失败')
      })
    })
  }

  watch([filter], ([filter]) => {
    refetch({
      customerId: filter.customerId,
      org: filter.org,
      projType: filter.projType,
    })
  })

  return {
    loading,
    filter,
    showProjs,
    subordinates,
    otherData,
    customers,
    saveActive
  };
}
