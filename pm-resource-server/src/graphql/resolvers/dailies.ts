import { AuthContext } from '../../auth/oauth'
import { EmployeeDaily, ProjDaily } from '../../mongodb'

export default {
  Query: {
    myDailies: (_: any, { date }: { date?: string }, context: AuthContext) => EmployeeDaily.findOne({ _id: context.user!.id }).then(ed => {
      if (ed !== null) {
        const { _id, ...other } = ed
        other.dailies = date ? other.dailies.filter(daily => daily.date === date) : other.dailies
        return { id: _id, ...other }
      }
      return {
        id: context.user!.id,
        dailies: [],
      }
    }),
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
