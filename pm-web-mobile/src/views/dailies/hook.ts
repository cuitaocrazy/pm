import type { Query, Project, EmployeeOfDaily, EmployeeOfDailyItem, DailyInput, MutationPushDailyArgs } from '@/apollo';
import { ref, watch, inject } from 'vue';
import { useQuery, useMutation, DefaultApolloClient } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import moment from 'moment';
import * as R from 'ramda';

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
    let tempProjs = JSON.parse(JSON.stringify(projs)) 
    // 筛选和登录人有关且的项目
    // tempArr = tempArr.filter(item => {
    //   return item.participants.find(chItem => chItem === employee)
    // })
    // 在个人日报中讲将选中的日期日报筛选出来
    const selDateProj = dailies.find(item => {
      if (item.date === moment(selectDate).format('YYYYMMDD')) {
        return true
      }
    })
    // 将项目按照日报对应匹配
    tempProjs = tempProjs.map(item => {
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
      if (!tempPro.dailyItem) {
        tempPro.dailyItem = {
          timeConsuming: 0,
          content: ''
        }
      }
      return tempPro
    })
    const projGrouping = R.groupBy<Project>((p) => {
      const writed = p.dailyItem.content && p.dailyItem.timeConsuming > 0;
      const onProj = p.status !== 'endProj';
      const involved = p.participants.includes(employee);

      if (writed && involved && onProj) {
        return 'writedAndInvolvedAndOnProj';
      }

      if (writed && involved && !onProj) {
        return 'writedAndInvolvedAndEndProj';
      }

      if (writed && !involved && onProj) {
        return 'writedAndExcludeAndOnProj';
      }

      if (writed && !involved && !onProj) {
        return 'writedAndExcludeAndEndProj';
      }

      if (!writed && involved && onProj) {
        return 'notWritedAndInvolvedAndOnProj';
      }

      if (!writed && involved && !onProj) {
        return 'notWritedAndInvolvedAndEndProj';
      }

      if (!writed && !involved && onProj) {
        return 'notWritedAndExcludeAndOnProj';
      }

      return 'notWritedAndExcludeAndEndProj';
    });

    const projGroup = projGrouping(tempProjs);
    const sortedProjs = R.reduce<Project[], Project[]>(
      R.concat,
      [],
      [
        projGroup.writedAndInvolvedAndOnProj || [],
        projGroup.writedAndExcludeAndOnProj || [],
        projGroup.writedAndInvolvedAndEndProj || [],
        projGroup.writedAndExcludeAndEndProj || [],
        projGroup.notWritedAndInvolvedAndOnProj || [],
        projGroup.notWritedAndExcludeAndOnProj || [],
        projGroup.notWritedAndInvolvedAndEndProj || [],
        projGroup.notWritedAndExcludeAndEndProj || [],
      ],
    );
    setTimeout(() => {
      setDailyProject(sortedProjs)
      loading.value = false
    }, 100)
  })

  const setDailyProject = (value: any) => {
    dailyProjects.value = value
  }

  const saveDailies = () => {
    let canSave = true
    const daliArr: DailyInput[]  = []
    dailyProjects.value.forEach(item => {
      if (item.dailyItem && (!!item.dailyItem.timeConsuming != !!item.dailyItem.content)) {
        canSave = false
      }
      if (item.dailyItem && item.dailyItem.timeConsuming > 0 && item.dailyItem.content) {
        daliArr.push({
          projId: item.id || item.dailyItem.project?.id || '',
          content: item.dailyItem.content,
          timeConsuming: item.dailyItem.timeConsuming / 10,
        })
      }
    })
    // return
    return new Promise((resolve, reject) => {
      if (canSave) {
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
      } else {
        reject('请补全工时和工作量')
      }
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
