import type { Project, User, Query, QueryFilterProjectArgs } from '@/apollo';
import { ref, watch, reactive } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { filterTodoProject } from '@/utils';

type Pro = Project & {
  key: string
  todoTip?: string
};

const queryGql = gql`
  query ($org: String, $projType: String, $type: String) {
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
    filterProjsByApp (org: $org, projType: $projType, type: $type) {
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
export function useProjectState() {
  const filter = reactive({
    org: '',
    projType: ''
  })
  const { onResult, refetch  } = useQuery<Query, QueryFilterProjectArgs>(queryGql, {
    org: filter.org,
    projType: filter.projType,
  }, { fetchPolicy: 'no-cache' });

  const tabValue = ref('1');
  const projs = ref<Project[]>();
  const showProjs = ref();
  const subordinates = ref<User[]>([]);
  const otherData = ref();
  const loading = ref(true);

  onResult((queryResult) => {
    if (queryResult.data) {
      projs.value = queryResult.data.filterProjsByApp || [];
      subordinates.value = queryResult?.data.subordinates || [];
      otherData.value = queryResult?.data || {}
      loading.value = false
    }
  });
  
  watch([tabValue, projs], ([tabValue, projs]) => {
    let tempArr = JSON.parse(JSON.stringify(projs)) || []
    if (tabValue === '1') {
      tempArr = filterTodoProject(tempArr)
    }
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

  watch([filter], ([filter]) => {
    refetch({
      org: filter.org,
      projType: filter.projType,
    })
  })

  return {
    loading,
    filter,
    tabValue,
    showProjs,
    subordinates,
    otherData
  };
}
