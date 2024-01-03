import { AuthContext, getAllGroups } from "../../auth/oauth";
export default {
  Query: {
    groups: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const groups = await getAllGroups(user);
      return groups
        .map((group) => group.path)
        .filter((str) => (str.match(/\//g) || []).length === 2);
    },
    detailgroups: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const groups = await getAllGroups(user);
      return groups
        .map((group) => group.path)
    },
  },
};
