import type { Query, Project, EmployeeOfDaily, EmployeeOfDailyItem, DailyInput, MutationPushDailyArgs } from '@/apollo';
import { ref, watch, inject } from 'vue';
import { useQuery, useMutation, DefaultApolloClient } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import moment from 'moment';

type Pro = Project & {
  key: string
  dailyItem?: EmployeeOfDailyItem
};

const queryGql = gql`
  {
    myDailies {
      employee {
        id
      }
      dailies {
        date
        dailyItems {
          project {
            id
          }
          timeConsuming
          content
        }
      }
    }

    projs {
      id
      name
      participants
      status
    }
  }
`;


const PushDaily = gql`
  mutation PushDaily($date: String!, $projDailies: [DailyInput!]!) {
    pushDaily(date: $date, projDailies: $projDailies)
  }
`;

export function useProjectState() {
  const apolloClient: any = inject(DefaultApolloClient)
  const { onResult, refetch } = useQuery<Query>(queryGql);
  const loading = ref(true);
  const selectDate = ref(new Date());
  const dailies = ref<EmployeeOfDaily[]>([]);
  const projs = ref<Project[]>([]);
  const dailyProjects = ref<Pro[]>([])
  let employee = ''

  onResult((queryResult) => {
    // console.log(queryResult)
    if (queryResult.data) {
      projs.value = queryResult.data.projs || [];
      dailies.value = queryResult.data.myDailies?.dailies || [];
      employee = queryResult.data.myDailies?.employee.id || '';
    }
  });

  watch([selectDate, dailies, projs], ([selectDate, dailies, projs]) => {
    // console.log(selectDate, dailies, projs)
    // 筛选和登录人有关且的项目
    let tempArr = JSON.parse(JSON.stringify(projs))
    tempArr = tempArr.filter(item => {
      return item.participants.find(chItem => chItem === employee)
    })
    // 将项目按照  启动  未启动 关闭 顺序排序
    tempArr = tempArr.sort((a, b) => {
      const order = { "onProj": 0, "endProj": 2 };
      const aNum = order[a.status] === undefined ? 1 : order[a.status]
      const bNum = order[b.status] === undefined ? 1 : order[b.status]
      return aNum - bNum;
    });
    // 在个人日报中讲选中的日期日报筛选出来
    const selDateProj = dailies.find(item => {
      if (item.date === moment(selectDate).format('YYYYMMDD')) {
        return true
      }
    })
    // 将项目按照日报对应匹配
    const tempDailyProjects:any = []
    tempArr.forEach(item => {
      const tempPro:Pro = JSON.parse(JSON.stringify(item))
      tempPro.key = item.id + '-' + Number(new Date())
      selDateProj?.dailyItems.forEach(chItem => {
        if (chItem.project?.id === item.id) {
          tempPro.dailyItem = JSON.parse(JSON.stringify(chItem))
          if (tempPro?.dailyItem?.timeConsuming) {
            tempPro.dailyItem.timeConsuming = tempPro.dailyItem.timeConsuming * 10
          }
        }
      });
      if (tempPro.dailyItem) {
        tempDailyProjects.unshift(tempPro)
      } else {
        tempPro.dailyItem = {
          timeConsuming: 0,
          content: ''
        }
        tempDailyProjects.push(tempPro)
      }
    })
    setTimeout(() => {
      setDailyProject(tempDailyProjects)
      loading.value = false
    }, 100)
  })

  const setDailyProject = (value: any) => {
    dailyProjects.value = value
  }

  const saveDailies = () => {
    const daliArr: DailyInput[]  = []
    dailyProjects.value.forEach(item => {
      if (item.dailyItem && item.dailyItem.timeConsuming > 0 && item.dailyItem.content) {
        daliArr.push({
          projId: item.id || item.dailyItem.project?.id || '',
          content: item.dailyItem.content,
          timeConsuming: item.dailyItem.timeConsuming / 10,
        })
      }
    })
    return new Promise((resolve, reject) => {
      const variables: MutationPushDailyArgs = {
        date: moment(selectDate.value).format('YYYYMMDD'),
        projDailies: daliArr
      }
      apolloClient.mutate({
        mutation: PushDaily,
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

  return {
    loading,
    projs,
    dailies,
    selectDate,
    dailyProjects,
    saveDailies
  };
}
