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
        const index = curEd.dailies.findIndex(d => d.date === date)
        if (index === -1) {
          curEd.dailies = curEd.dailies.concat({ date, projs: projDailies }).sort((a, b) => a.date > b.date ? 1 : -1)
        } else {
          curEd.dailies[index] = { date, projs: projDailies }
        }
        curEd.dailies = curEd.dailies
          .map(pds => ({ date: pds.date, projs: pds.projs.filter(p => p.timeConsuming !== 0) }))
          .filter(pds => pds.projs.reduce((s, e) => s + e.timeConsuming, 0))
        return EmployeeDaily.replaceOne({ _id: context.user!.id }, curEd, { upsert: true }).then(() => context.user!.id)
      }),
  },
}
