import moment from "moment";
import { isNil } from "ramda";
import { AuthContext, getUsersByGroups } from "../../auth/oauth";
import { MarketPlan } from "../../mongodb";
import { ObjectId } from "mongodb";
import { dbid2id, id2dbid, getMaxGroup } from "../../util/utils";
export default {
  Query: {
    marketPlansBySuper: (_: any, __: any, context: AuthContext) =>
      MarketPlan.find().sort({ week: -1 }).map(dbid2id).toArray(),
    marketPlans: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];

      // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
      if (maxGroup[0].split("/").length < 4) {
        const subordinate = await getUsersByGroups(user, maxGroup);
        subordinateIds = subordinate.map((subordinate) => subordinate.id);
      }

      return MarketPlan.find({
        $or: [
          { leader: context.user!.id },
          { leader: { $in: subordinateIds } },
        ],
      })
        .sort({ week: -1 })
        .map(dbid2id)
        .toArray();
    },
  },
  Mutation: {
    pushMarketPlan: async (_: any, args: any, context: AuthContext) => {
      const { id, ...marketPlan } = args.marketPlan;
      // 判断是否有此项目，如果没有则为第一次创建
      marketPlan.week = moment(marketPlan.week).format("YYYY-[W]W");
      if (marketPlan.week.length == 7) {
        marketPlan.week = marketPlan.week.replace("-W", "-W0");
      }
      marketPlan.updateTime = moment()
        .utc()
        .utcOffset(8 * 60)
        .format("YYYY-MM-DD HH:mm:ss");

      const repeatWeek = await MarketPlan.findOne({
        leader: marketPlan.leader,
        week: marketPlan.week,
      });
      if (repeatWeek && (!id || id !== repeatWeek._id.toString())) {
        return new Error(`已经存在选中周的计划，请重新选择周！`);
      }

      const repeat = await MarketPlan.findOne({
        $or: [{ _id: new ObjectId(id) }, { _id: id }],
      });
      if (isNil(repeat)) {
        marketPlan.leader = context.user!.id;
        marketPlan.createDate = moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD");
      }
      return MarketPlan.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: marketPlan },
        { upsert: true }
      ).then((res) => id || res.upsertedId._id);
    },
    deleteMarketPlan: async (_: any, args: any, context: AuthContext) => {
      return MarketPlan.deleteOne({
        $or: [{ _id: new ObjectId(args.id) }, { _id: args.id }],
      }).then(() => args.id);
    },
  },
};
