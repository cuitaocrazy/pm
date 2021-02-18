

import { Project } from '../../mongodb'


const ChangePmInput = async (projIds: string[],leader:string,isRemovePart:boolean) => {
  
    let results:string[] = []
    for(const projId of projIds){
      const projs = await Project.find({ _id: projId }).toArray();
      if(projs.length===1){
          if(isRemovePart){
              const oldleader = projs[0].leader
              projs[0].participants = projs[0].participants.filter(part=>part!=oldleader)
          }
          projs[0].leader=leader;
          projs[0].participants= projs[0].participants.filter(part=>part!=leader);
          projs[0].participants.push(leader);
      }
      const result = await Project.updateOne({ _id: projId }, {$set: projs[0]}, { upsert: true }).then(() => projs[0].name);
      results.push(result)
    }

    return results
    
    
  }


export default {

  Mutation: {
    pushChangePm: async (_: any, args: any) => {
        const { projIds,leader,isRemovePart } = args.changePm

        const result = await ChangePmInput(projIds,leader,isRemovePart)
        return result
    }
  },
}



