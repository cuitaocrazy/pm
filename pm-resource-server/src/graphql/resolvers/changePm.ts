
import { BulkWriteUpdateOneOperation } from 'mongodb'
import { Project } from '../../mongodb'

const ChangePmInput = async (projIds: string[], leader:string, isRemovePart:boolean) => {
  const bulkWriteArgs : Array<BulkWriteUpdateOneOperation<any>> = []
  for (const projId of projIds) {
    const projs = await Project.find({ _id: projId }).toArray()
    if (projs.length === 1) {
      if (isRemovePart) {
        const oldleader = projs[0].leader
        projs[0].participants = projs[0].participants.filter(part => part !== oldleader)
      }
      projs[0].leader = leader
      projs[0].participants = projs[0].participants.filter(part => part !== leader)
      projs[0].participants.push(leader)
    }

    bulkWriteArgs.push({ updateOne: { filter: { _id: projId }, update: { $set: projs[0] }, upsert: true } })
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
