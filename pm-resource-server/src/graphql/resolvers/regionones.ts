/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 16:03:33
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-11-21 16:14:11
 * @FilePath: /pm/pm-resource-server/src/graphql/resolvers/regionones.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import moment from "moment";
import { isNil } from "ramda";
import { AuthContext } from "../../auth/oauth";
import { ObjectId } from "mongodb";
import { RegionOne } from "../../mongodb";
import { dbid2id } from "../../util/utils";

export default {
  Query: {
    regionones: (_: any, __: any, context: AuthContext) =>
      RegionOne.find({ isDel: false }).sort({ sort: 1 }).map(dbid2id).toArray(),
  },
  Mutation: {
    pushRegionOne: async (_: any, args: any, context: AuthContext) => {
      const { id, ...region } = args.region;
      if (!id) {
        let repeat = await RegionOne.findOne({ code: region.code });
        if (!isNil(repeat)) {
          return new Error(`区域编码重复！`);
        }
        region.createDate = moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD");
        region.isDel = false;
      }
      return RegionOne.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: region },
        { upsert: true }
      ).then((res) => id || res.upsertedId._id);
    },
    deleteRegionOne: (_: any, args: any, context: AuthContext) => {
      const id = args.id;
      return RegionOne.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: { isDel: true } }
      ).then((res) => args.id || res.upsertedId._id);
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
};
