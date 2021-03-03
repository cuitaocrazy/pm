
import { BulkWriteUpdateOneOperation } from 'mongodb'
import { Project } from '../../mongodb'

const ChangePmInput = async (projIds: string[], leader:string, isRemovePart:boolean) => {
  const bulkWriteArgs : Array<BulkWriteUpdateOneOperation<any>> = []
  for (const projId of projIds) {
    const proj = await Project.findOne({ _id: projId })
    if (proj) {
      if (isRemovePart) {
        const oldleader = proj.leader
        proj.participants = proj.participants.filter(part => part !== oldleader)
      }
      proj.leader = leader
      proj.participants = proj.participants.filter(part => part !== leader)
      proj.participants.push(leader)
      bulkWriteArgs.push({ updateOne: { filter: { _id: projId }, update: { $set: proj }, upsert: true } })
    }
  }
  const result = await Project.bulkWrite(bulkWriteArgs)
  return result.modifiedCount
}

export default {

  Mutation: {
    pushChangePm: async (_: any, args: any) => {
      const { projIds, leader, isRemovePart } = args.changePm

      const result = await ChangePmInput(projIds, leader, isRemovePart)
      return result
    },
  },
}
