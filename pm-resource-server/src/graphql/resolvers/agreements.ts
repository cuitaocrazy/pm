/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 09:20:39
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-12-04 10:20:39
 * @FilePath: /pm/pm-resource-server/src/graphql/resolvers/agreements.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE,
 */
import moment from "moment";
import { isNil } from "ramda";
import { AuthContext } from "../../auth/oauth";
import { ObjectId } from "mongodb";
import {
  Agreement,
  ProjectAgreement,
  PaymentManage,
  Project,
} from "../../mongodb";
import { dbid2id } from "../../util/utils";

export default {
  Query: {
    agreements: async (_: any, __: any, context: AuthContext) => {
      // console.dir(__, { depth: null, colors: true });
      let { page, pageSize, name, customer, type } = __;
      if (!page || page === 0) {
        page = 1;
      }
      if (!pageSize || pageSize === 0) {
        pageSize = 10;
      }
      const skip = (page - 1) * pageSize;
      const filter = { isDel: false };
      // 添加 name 查询条件
      if (name) {
        filter["name"] = new RegExp(name, "i"); // 不区分大小写的模糊查询
      }

      // 添加 customer 查询条件
      if (customer && customer.length != 0) {
        filter["customer"] = customer[0]; // 精确匹配 customer
      }

      // 添加 type 查询条件
      if (type && type.length != 0) {
        filter["type"] = type[0]; // 精确匹配 type
      }

      const result = await Agreement.find(filter)
        .skip(skip)
        .limit(pageSize)
        .sort({ sort: 1 })
        .map(dbid2id)
        .toArray();

      const total = await Agreement.countDocuments(filter);
      return { result, total, page };
    },
  },
  Mutation: {
    pushAgreement: async (_: any, args: any, context: AuthContext) => {
      const { id, ...agreement } = args.agreement;
      // console.dir(args.agreement, { depth: null, colors: true });
      if (!id) {
        agreement.createDate = moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD");
        agreement.isDel = false;
      }
      const _id = new ObjectId(id);
      // 先清除旧的绑定关系
      await ProjectAgreement.deleteMany({ agreementId: _id.toString() });
      agreement.contactProj.forEach(async (proID) => {
        // 重新绑定
        await ProjectAgreement.updateOne(
          { _id: proID },
          { $set: { agreementId: _id.toString() } },
          { upsert: true }
        ).then((res) => proID || res.upsertedId._id);
        //根据项目ID，去更改合同状态
        await Project.updateOne(
          { _id: proID }, // 查询条件
          { $set: { contractState: 1 } } // 更新 contractState 字段
        ).then((res) => proID || res.upsertedId._id);
      });
      console.dir(agreement.contactProj, { depth: null, color: true });
      delete agreement.contactProj;
      if (!id) {
        return Agreement.updateOne(
          { _id: _id },
          { $set: agreement },
          { upsert: true }
        ).then((res) => id || res.upsertedId._id);
      } else {
        return Agreement.updateOne(
          { $or: [{ _id: _id }, { _id: id }] },
          { $set: agreement }
        ).then((res) => id || res.upsertedId._id);
      }
    },
    payWaySub: async (_: any, args: any, context: AuthContext) => {
      // console.dir(args, { depth: null, color: true });
      let { milestone, ...agreement } = args.agreement;
      // 遍历 milestone 并插入数据
      const inserts = milestone.map((item) => ({
        payWayName: agreement.payWayName,
        milestone: agreement.milestone,
        contractId: agreement.id,
        name: agreement.name,
        customer: agreement.customer,
        type: agreement.type,
        fileList: agreement.fileList,
        startTime: agreement.startTime,
        endTime: agreement.endTime,
        remark: agreement.remark,
        contractSignDate: agreement.contractSignDate,
        contractAmount: agreement.contractAmount,
        afterTaxAmount: agreement.afterTaxAmount,
        contractPeriod: agreement.contractPeriod,
        contractNumber: agreement.contractNumber,
        maintenanceFreePeriod: agreement.maintenanceFreePeriod,
        isDel: agreement.isDel,
        createDateContract: agreement.createDate,
        createDate: moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD"),
        milestoneName: item.name, // 添加 milestoneName
        milestoneValue: item.value, // 添加 milestoneValue
      }));

      // console.dir(agreement.id, { depth: null, color: true });
      await Agreement.updateOne(
        { $or: [{ _id: new ObjectId(agreement.id) }] },
        {
          $set: {
            payWayName: agreement.payWayName,
            milestone: milestone,
          },
        }
      ).then((e) => {
        // console.dir(e, { depth: null, color: true });
      });
      delete agreement._id;
      return PaymentManage.insertMany(inserts).then(
        (res) => args.id || res.insertedIds[0]
      );
    },
    deleteAgreement: async (_: any, args: any, context: AuthContext) => {
      const _id = new ObjectId(args.id);
      await ProjectAgreement.deleteMany({ agreementId: _id.toString() });
      return Agreement.updateOne(
        { $or: [{ _id: _id }, { _id: args.id }] },
        { $set: { isDel: true } }
      ).then((res) => args.id || res.upsertedId._id);
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
};
