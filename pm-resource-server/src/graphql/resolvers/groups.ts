import { AuthContext, getAllGroups } from "../../auth/oauth";
export default {
  Query: {
    /**
     * 获取所有的group
     * @param _
     * @param __
     * @param context
     * @returns
     */
    groups: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      console.log(user);
      let groups;
      try {
        groups = await getAllGroups(user);
      } catch (e) {
        console.log(e);
        groups = [];
      }
      return groups
        .map((group) => group.path)
        .filter((str) => (str.match(/\//g) || []).length === 2);
    },
    /**
     * 获取所有的group
     * @param _
     * @param __
     * @param context
     * @returns
     */
    detailgroups: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const groups = await getAllGroups(user);
      return groups.map((group) => group.path);
    },
  },
};
