import { find, propEq, isNil } from 'ramda'
import { AuthContext, getGroupUsers } from '../../auth/oauth'
import { EmployeeDaily, ProjDaily, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

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
      EmployeeDaily.findOne({ _id: context.user!.id }).then(d => {
        const curEd = d || { _id: context.user!.id, dailies: [] }
        let dailies = curEd.dailies.filter(d => d.date !== date)
        if (projDailies.reduce((s, e) => s + e.timeConsuming, 0)) {
          dailies = dailies.concat({ date, projs: projDailies })
        }
        curEd.dailies = dailies.sort((a, b) => a.date > b.date ? 1 : -1)
        return EmployeeDaily.replaceOne({ _id: context.user!.id }, curEd, { upsert: true }).then(() => context.user!.id)
      }),
  },
}
