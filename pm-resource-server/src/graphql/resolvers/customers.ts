import moment from "moment";
import { isNil } from "ramda";
import { AuthContext } from "../../auth/oauth";
import { ObjectId } from "mongodb";
import { Customer } from "../../mongodb";
import { dbid2id, addEventLog } from "../../util/utils";

export default {
  Query: {
    customers: async (_: any, __: any, context: AuthContext) => {
      let { region, industry, page, pageSize } = __;
      if (!page || page === 0) {
        page = 1;
      }
      if (!pageSize || pageSize === 0) {
        pageSize = 10;
      }
      const skip = (page - 1) * pageSize;
      const filter = { isDel: false };
      if (region) {
        filter["regionCode"] = region;
      }
      if (industry) {
        filter["industryCode"] = industry;
      }
      const result = await Customer.find(filter)
        .skip(skip)
        .limit(pageSize)
        .sort({ sort: 1 })
        .map(dbid2id)
        .toArray();
      const total = await Customer.find(filter).count();
      return {
        result,
        page,
        total,
      };
    },
  },
  Mutation: {
    pushCustomer: async (_: any, args: any, context: AuthContext) => {
      const { id, ...customer } = args.customer;
      if (!id) {
        customer.createDate = moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD");
        customer.isDel = false;
        // 记录新增日志
        addEventLog({
          changeUser: context.user!.id,
          type: "add",
          target: "customer",
          oldValue: "",
          newValue: JSON.stringify(args.customer),
          description: "新增基础客户",
        });
      } else {
        let customer = await Customer.findOne({
          $or: [{ _id: new ObjectId(id) }, { _id: id }],
        });
        // 记录修改日志
        addEventLog({
          changeUser: context.user!.id,
          type: "edit",
          target: "customer",
          oldValue: JSON.stringify(customer),
          newValue: JSON.stringify(args.customer),
          description: "修改市场客户",
        });
      }
      // { $or: [{ _id: new ObjectId(id) }, { _id: id }] }, ID取值需要统一处理 TODO
      return Customer.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: customer },
        { upsert: true }
      ).then((res) => id || res.upsertedId._id);
    },
    deleteCustomer: async (_: any, args: any, context: AuthContext) => {
      const id = args.id;
      const customer = await Customer.findOne({
        $or: [{ _id: new ObjectId(id) }, { _id: id }],
      });
      // 记录删除日志
      addEventLog({
        changeUser: context.user!.id,
        type: "delete",
        target: "customer",
        oldValue: JSON.stringify(customer),
        newValue: "",
        description: "删除基础客户",
      });
      return Customer.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: { isDel: true } }
      ).then((res) => args.id || res.upsertedId._id);
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
};
