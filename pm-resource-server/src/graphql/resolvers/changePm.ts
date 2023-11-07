
import { BulkWriteUpdateOneOperation, ObjectId } from 'mongodb'
import { AuthContext } from '../../auth/oauth';
import { Project, EventLog } from '../../mongodb'
import { addEventLog } from '../../util/utils'
import { clone } from 'ramda';

const ChangePmInput = async (projIds: string[], leader:string, isRemovePart:boolean, context: AuthContext) => {
  const bulkWriteArgs : Array<BulkWriteUpdateOneOperation<any>> = []
  for (const projId of projIds) {
    const proj = await Project.findOne({ _id: projId })
    const oldProj = clone(proj)
    if (proj) {
      if (isRemovePart) {
        const oldleader = proj.leader
        proj.participants = proj.participants.filter(part => part !== oldleader)
      }
     
      proj.leader = leader
      proj.participants = proj.participants.filter(part => part !== leader)
      proj.participants.push(leader)
      bulkWriteArgs.push({ updateOne: { filter: { _id: projId }, update: { $set: proj }, upsert: true } })
      // 记录日志
      addEventLog({
        changeUser: context.user!.id, 
        target: proj._id,
        oldValue: JSON.stringify(oldProj),
        newValue: JSON.stringify(proj),
        description: '修改项目负责人'
      })
    }
  }
  const result = await Project.bulkWrite(bulkWriteArgs)
  return result.modifiedCount
}

export default {
  Mutation: {
    pushChangePm: async (_: any, args: any, context: AuthContext) => {
      const { projIds, leader, isRemovePart } = args.changePm
      const result = await ChangePmInput(projIds, leader, isRemovePart, context)
      return result
    },
  },
}
