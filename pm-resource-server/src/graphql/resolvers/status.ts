import moment from 'moment'
import { AuthContext } from '../../auth/oauth'
import { ObjectId } from 'mongodb'
import { Statu } from '../../mongodb'
import { dbid2id } from '../../util/utils'

async function getTreeStatus () {
  const data:any[] = []
  await Statu.find({ isDel: false }).sort({ sort: 1 }).map(dbid2id).forEach(statu => {
    data.push(statu)
  })
  const treeStatus:any[] = []
  const idMapping = data.reduce((acc, el, i) => {
    acc[el.id] = i
    return acc
  }, {})
  data.forEach((el) => {
    // 判断根节点
    if (el.pId === '0') {
      treeStatus.push(el)
      return
    }
    // 用映射表找到父元素
    const parentEl = data[idMapping[el.pId]]
    // 把当前元素添加到父元素的`children`数组中
    if (parentEl) {
      parentEl.children = [...(parentEl.children || []), el]
    }
  })
  return treeStatus
}

export default {
  Query: {
    status: (_: any, __: any, context: AuthContext) => Statu
      .find()
      .sort({ sort: 1 })
      .map(dbid2id)
      .toArray(),
    treeStatus: (_: any, __: any, context: AuthContext) => {
      return getTreeStatus()
    },
  },
  Mutation: {
    pushStatu: (_: any, args: any, context: AuthContext) => {
      const { id, ...statu } = args.statu
      // 处理导入数据的_id不是 ObjectId 的问题
      if (!id) {
        statu.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        statu.isDel = false
      }
      return Statu.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: statu }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteStatu: (_: any, args: any, context: AuthContext) => {
      // console.log(args)
      const id = args.id
      return Statu.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: { isDel: true } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
}
