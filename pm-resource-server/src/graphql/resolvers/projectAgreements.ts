import moment from "moment";
import { isNil } from "ramda";
import { AuthContext } from "../../auth/oauth";
import { ObjectId } from "mongodb";
import { ProjectAgreement } from "../../mongodb";
import { dbid2id } from "../../util/utils";

export default {
  Query: {
    projectAgreements: async (_: any, __: any, context: AuthContext) => {
      let { id } = __;
      let filter = {};
      if (id) {
        filter = { _id: id };
      }
      return ProjectAgreement.find(filter).map(dbid2id).toArray();
    },
  },
  Mutation: {},
};
