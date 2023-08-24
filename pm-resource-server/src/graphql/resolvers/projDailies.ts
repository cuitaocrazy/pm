import { head, includes, find, propEq, isNil } from 'ramda'
import { AuthContext, getGroupUsers } from '../../auth/oauth'
import { EmployeeDaily, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

async function getParticipateProjectDailiesByLeader (leaderId: string, projId: string) {
  const projIds = await Project.find({ leader: leaderId }).map(proj => proj._id).toArray()

  if (includes(projId)(projIds)) {
    const d = await EmployeeDaily.aggregate([
      {
        $match: {
          'dailies.projs.projId': projId,
        },
      },
      // 过滤掉跟项目无关掉日报
      {
        $project: {
          dailies: {
            $map: {
              input: '$dailies',
              as: 'daily',
              in: {
                date: '$$daily.date',
                dailyItems: {
                  $filter: {
                    input: '$$daily.projs',
                    as: 'p',
                    cond: { $eq: ['$$p.projId', projId] },
                  },
                },
              },
            },
          },
        },
      },
      // 过滤掉空集合
      {
        $project: {
          dailies: {
            $filter: {
              input: '$dailies',
              as: 'd',
              cond: { $ne: [{ $size: '$$d.dailyItems' }, 0] },
            },
          },
        },
      },
      // 转换成平坦对象
      { $unwind: '$dailies' },
      { $unwind: '$dailies.dailyItems' },
      {
        $sort: { _id: 1 },
      },
      {
        $group: {
          _id: {
            date: '$dailies.date',
            projId: '$dailies.dailyItems.projId',
          },
          dailies: {
            $push: {
              userId: '$_id',
              timeConsuming: '$dailies.dailyItems.timeConsuming',
              content: '$dailies.dailyItems.content',
            },
          },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
      {
        $group: {
          _id: '$_id.projId',
          dailies: {
            $push: {
              date: '$_id.date',
              dailyItems: '$dailies',
            },
          },
        },
      },
    ]).toArray()
    return ({
      ...dbid2id(head(d)),
      projId,
    })
  } else {
    return getDeafultDailies(projId)
  }
}

function getDeafultDailies (projId: string) {
  return {
    projId,
    dailies: [],
  }
}

export default {
  Query: {
    projDaily: async (_: any, { projId }: any, context: AuthContext) => {
      const user = context.user!
      return getParticipateProjectDailiesByLeader(user.id, projId)
    },
  },
  ProjectOfDailies: {
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
  ProjectOfDailyItem: {
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
}
