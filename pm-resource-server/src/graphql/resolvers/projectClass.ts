import moment from "moment";
import { isNil } from "ramda";
import { AuthContext } from "../../auth/oauth";
import { ObjectId } from "mongodb";
import { ProjectClass } from "../../mongodb";
import { dbid2id } from "../../util/utils";

export default {
  Query: {
    projectclasses: (_: any, __: any, context: AuthContext) =>
      ProjectClass.find({ isDel: false })
        .sort({ sort: 1 })
        .map(dbid2id)
        .toArray(),
  },
  Mutation: {
    pushProjectClass: async (_: any, args: any, context: AuthContext) => {
      const { id, ...projectClass } = args.projectClass;
      if (!id) {
        const repeat = await ProjectClass.findOne({ code: projectClass.code });
        if (!isNil(repeat)) {
          return new Error("项目类型编码重复！");
        }
        projectClass.createDate = moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD");
        projectClass.isDel = false;
      }
      return ProjectClass.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: projectClass },
        { upsert: true }
      ).then((res) => id || res.upsertedId._id);
    },
    deleteProjectClass: (_: any, args: any, context: AuthContext) => {
      const id = args.id;
      return ProjectClass.updateOne(
        { $or: [{ _id: new ObjectId(id) }, { _id: id }] },
        { $set: { isDel: true } }
      ).then((res) => args.id || res.upsertedId._id);
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
};
