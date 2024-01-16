import moment from "moment";
import { isNil } from "ramda";
import { AuthContext } from "../../auth/oauth";
import { ObjectId } from "mongodb";
import { ProjectAgreement, Agreement } from "../../mongodb";
import { dbid2id } from "../../util/utils";

export default {
  Query: {
    projectAgreements: async (_: any, __: any, context: AuthContext) => {
      return ProjectAgreement.find({}).map(dbid2id).toArray();
    },

    getAgreementsByProjectId: async (_: any, __: any, context: AuthContext) => {
      let { id } = __;
      let paFilter = {};
      if (id) {
        paFilter = { _id: id };
      }

      const agreementIds = await ProjectAgreement.find(paFilter)
        .map((projectAgreement) => new ObjectId(projectAgreement.agreementId))
        .toArray();
      const agreementFilter = { _id: { $in: agreementIds }, isDel: false };
      const result = await Agreement.find(agreementFilter)
        .sort({ sort: 1 })
        .map(dbid2id)
        .toArray();
      return result;
    },
  },
  Mutation: {},
};
