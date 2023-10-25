import { find, propEq, isNil, head, map } from 'ramda';
import { AuthContext, getGroupUsers } from '../../auth/oauth'
import { EmployeeDaily, ProjDaily, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

async function getParticipateProjectDailies() {
  const d: any[] = await EmployeeDaily.aggregate([
    // 转换成平坦对象
    { $unwind: '$dailies' },
    { $unwind: '$dailies.projs' },
    {
      $group: {
        _id: '$dailies.projs.projId',
        total: { $sum: '$dailies.projs.timeConsuming' },
      },
    }
  ]).toArray()
  const allProj = await Project.find().toArray()
  allProj.forEach(proj => {
    const samePro = d.find(v => v._id === proj._id)
    Project.updateOne({ _id: proj._id }, { $set: { timeConsuming: samePro ? samePro.total : 0 } }, { upsert: true }).then((res) => res)
  })
}

export default {
  Query: {
    myDailies: (_: any, { date }: { date?: string }, context: AuthContext) => EmployeeDaily.findOne({ _id: context.user!.id }).then(ed => {
      const user = context.user!
      if (ed !== null) {
        ed.dailies = date ? ed.dailies.filter(daily => daily.date === date) : ed.dailies
        return {
          userId: user.id,
          dailies: ed.dailies.map(item => ({
            ...item,
            dailyItems: item.projs,
          })),
        }
      }
      return {
        userId: user.id,
        dailies: [],
      }
    }),
  },
  EmployeeOfDailies: {
    employee: async ({ userId }: any, _: any, context: AuthContext) => {
      const user = context.user!
      const users = await getGroupUsers(user)
      const projUser = find(propEq('id', userId), users)
      // TODO 当日报中对应的用户不存在时的临时处理方案
      return isNil(projUser)
        ? ({
            id: userId,
            name: userId,
          })
        : projUser
    },
  },
  EmployeeOfDailyItem: {
    project: async ({ projId }: any) => {
      const project = await Project.findOne({ _id: projId })
      // TODO 当费用中对应的项目不存在时的临时处理方案
      return isNil(project)
        ? ({
            id: projId,
            name: projId,
          })
        : dbid2id(project)
    },
  },
  Mutation: {
    pushDaily: (_: any, { date, projDailies }: { date: string, projDailies: ProjDaily[] }, context: AuthContext) =>
      EmployeeDaily.findOne({ _id: context.user!.id }).then(async d => {
        const curEd = d || { _id: context.user!.id, dailies: [] }
        let dailies = curEd.dailies.filter(d => d.date !== date)
        if (projDailies.reduce((s, e) => s + e.timeConsuming, 0)) {
          dailies = dailies.concat({ date, projs: projDailies })
        }
        curEd.dailies = dailies.sort((a, b) => a.date > b.date ? 1 : -1)
        let request = await EmployeeDaily.replaceOne({ _id: context.user!.id }, curEd, { upsert: true }).then(() => context.user!.id)
        // 更新项目内日报
        getParticipateProjectDailies()
        return request
      }),
  },
}
