/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 09:20:39
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-11-25 12:09:36
 * @FilePath: /pm/pm-resource-server/src/graphql/resolvers/regions.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import moment from "moment";
import { isNil } from "ramda";
import { AuthContext } from "../../auth/oauth";
import { ObjectId } from "mongodb";
import { Region, RegionOne } from "../../mongodb";
import { dbid2id } from "../../util/utils";

export default {
  Query: {
    regions: async (_: any, __: any, context: AuthContext) => {
      /**Region
      .find({ isDel: false })
      .sort({ sort: 1 })
      .map(dbid2id)
      .toArray(), */
      let regionones = await RegionOne.find({ isDel: false })
        .sort({ sort: 1 })
        .map(dbid2id)
        .toArray();
      let region = await Region.find({ isDel: false })
        .sort({ sort: 1 })
        .map(dbid2id)
        .toArray();
      const regionsWithParentName = region.map((item) => {
        const parent = regionones.find((p) => p.id == item.parentId);
        return {
          ...item,
          parentName: parent ? parent.name : null, // 匹配不到时为 null
        };
      });
      return regionsWithParentName;
    },
  },
  Mutation: {
    pushRegion: async (_: any, args: any, context: AuthContext) => {
      const { id, ...region } = args.region;
      if (!id) {
        let repeat = await Region.findOne({ code: region.code });
        if (!isNil(repeat)) {
          return new Error(`区域编码重复！`);
        }
        region.createDate = moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD");
        region.isDel = false;
      }
      return Region.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: region },
        { upsert: true }
      ).then((res) => id || res.upsertedId._id);
    },
    deleteRegion: (_: any, args: any, context: AuthContext) => {
      const id = args.id;
      return Region.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: { isDel: true } }
      ).then((res) => args.id || res.upsertedId._id);
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
};
