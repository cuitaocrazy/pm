import moment from "moment";
import { isNil } from "ramda";
import { AuthContext, getUsersByGroups } from "../../auth/oauth";
import { Market } from "../../mongodb";
import { ObjectId } from "mongodb";
import { dbid2id, id2dbid, addEventLog, getMaxGroup } from "../../util/utils";

export default {
  Query: {
    marketsBySuper: (_: any, __: any, context: AuthContext) => {
      return Market.find({ isDel: false })
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
    },
    markets: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];

      // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
      if (maxGroup[0].split("/").length < 4) {
        const subordinate = await getUsersByGroups(user, maxGroup);
        subordinateIds = subordinate.map((subordinate) => subordinate.id);
      }
      return Market.find({
        $or: [
          { leader: context.user!.id },
          { participants: { $elemMatch: { $eq: context.user!.id } } },
          { leader: { $in: subordinateIds } },
        ],
        isDel: false,
      })
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
    },
  },
  Mutation: {
    pushMarket: async (_: any, args: any, context: AuthContext) => {
      const { id, ...market } = args.market;
      // 判断是否有此项目，如果没有则为第一次创建
      let repeat = await Market.findOne({
        $or: [{ _id: new ObjectId(id) }, { _id: id }],
      });
      if (isNil(repeat)) {
        market.createDate = moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD");
        market.isDel = false;
        // 记录新增日志
        addEventLog({
          changeUser: context.user!.id,
          type: "add",
          target: "market",
          oldValue: "",
          newValue: JSON.stringify(args.market),
          description: "新增市场客户",
        });
      } else {
        market.createDate = repeat.createDate;
        market.isDel = repeat.isDel;
        // 记录修改日志
        addEventLog({
          changeUser: context.user!.id,
          type: "edit",
          target: "market",
          oldValue: JSON.stringify(repeat),
          newValue: JSON.stringify(args.market),
          description: "修改市场客户",
        });
      }
      let isRep = false;
      let proMap = {};
      (market.projects || []).forEach((pro) => {
        if (proMap[pro.name]) isRep = true;
        else proMap[pro.name] = true;
      });
      if (isRep) return new Error(`同一机构下项目名称不可重复！`);
      market.updateTime = moment()
        .utc()
        .utcOffset(8 * 60)
        .format("YYYY-MM-DD HH:mm:ss");
      return Market.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: market },
        { upsert: true }
      ).then((res) => id || res.upsertedId._id);
    },
    deleteMarket: async (_: any, args: any, context: AuthContext) => {
      const id = args.id;
      const market = await Market.findOne({
        $or: [{ _id: new ObjectId(id) }, { _id: id }],
      });
      // 记录删除日志
      addEventLog({
        changeUser: context.user!.id,
        type: "delete",
        target: "market",
        oldValue: JSON.stringify(market),
        newValue: "",
        description: "删除市场客户",
      });
      return Market.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: { isDel: true } }
      ).then((res) => args.id || res.upsertedId._id);
    },
  },
};
