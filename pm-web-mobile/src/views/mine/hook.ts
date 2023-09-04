import type { Project, User, Query, QueryProjectArgs } from '@/apollo';
import { ref } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

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
    iLeadProjs (isArchive: $isArchive) {
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
  const { onResult } = useQuery<Query, QueryProjectArgs>(queryGql, {
    isArchive: false,
  });
  const projs = ref<Project[]>();
  const subordinates = ref<User[]>([]);
  const loading = ref(true);

  onResult((queryResult) => {
    if (queryResult.data) {
      projs.value = queryResult.data.iLeadProjs || [];
      subordinates.value = queryResult?.data.subordinates || [];
      loading.value = false
    }
  });

  return {
    loading,
    projs,
    subordinates
  };
}
