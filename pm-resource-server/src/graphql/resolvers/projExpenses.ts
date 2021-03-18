import { includes, isEmpty, head, isNil, find, propEq } from 'ramda'
import { AuthContext, getGroupUsers } from '../../auth/oauth'
import { Cost, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

async function getParticipateProjectCostByLeader (leaderId: string, projId: string) {
  const projIds = await Project.find({ leader: leaderId }).map(proj => proj._id).toArray()

  if (includes(projId)(projIds)) {
    const d = await Cost.aggregate([
      {
        $match: {
          'projs.id': projId,
        },
      },
      // 过滤掉跟项目无关的费用
      {
        $project: {
          projs: {
            $filter: {
              input: '$projs',
              as: 'p',
              cond: { $eq: ['$$p.id', projId] },
            },
          },
          participant: 1,
          createDate: 1,
        },
      },
      // 转换成平坦对象
      { $unwind: '$projs' },
      {
        $sort: { _id: 1 },
      },
      {
        $group: {
          _id: '$projs.id',
          costs: {
            $push: {
              userId: '$participant',
              amount: '$projs.amount',
              createDate: '$createDate',
              type: '$projs.type',
              description: '$projs.description',
            },
          },
        },
      },
      {
        $project: {
          projId: '$_id',
          items: '$costs',
        },
      },
    ]).toArray()

    return isEmpty(d) ? getDeafultCost(projId) : head(d)
  } else {
    return getDeafultCost(projId)
  }
}

function getDeafultCost (projId: string) {
  return {
    projId,
    items: [],
  }
}

export default {
  Query: {
    projCosts: async (_: any, { projId }: any, context: AuthContext) => {
      const user = context.user!
      return getParticipateProjectCostByLeader(user.id, projId)
    },
  },
  ProjectOfExpenses: {
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
  ProjectOfExpensesItem: {
    employee: async ({ userId }: any, _: any, context: AuthContext) => {
      const user = context.user!
      const users = await getGroupUsers(user)
      const costUser = find(propEq('id', userId), users)
      // TODO 当费用中对应的用户不存在时的临时处理方案
      return isNil(costUser)
        ? ({
            id: userId,
            name: userId,
          })
        : costUser
    },
  },
}
