import moment from "moment";
import { isNil } from "ramda";
import { AuthContext } from "../../auth/oauth";
import { ObjectId } from "mongodb";
import { Agreement, ProjectAgreement } from "../../mongodb";
import { dbid2id } from "../../util/utils";

export default {
  Query: {
    agreements: async (_: any, __: any, context: AuthContext) => {
      let { page, pageSize, name } = __;
      if (!page || page === 0) {
        page = 1;
      }
      if (!pageSize || pageSize === 0) {
        pageSize = 10;
      }
      const skip = (page - 1) * pageSize;
      const filter = { isDel: false };
      if (name) {
        filter["name"] = new RegExp(name, "g");
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
      });
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
