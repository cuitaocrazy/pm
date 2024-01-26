import moment from "moment";
import { getWorkDays } from "./util/utils";
import { Users } from "./keycloak";
import { DailyInfo, ProjectMailInfo, UserInfo } from "./data";
import { Project } from "./mongodb";
import * as R from "ramda";

import {
  transporter,
  sendEmails,
  sendWeiHuEmail,
  sendYanShouEmail,
  closeTransporter,
} from "./emailer";

const month = moment().year(2020).year();
console.log(month);
console.log(moment("20240107", "YYYYMMDD").valueOf());
export const getUsers = async (): Promise<UserInfo[]> => {
  const users = await Users()
    .then((users) => users.find())
    .then(
      R.map((u: any) => {
        return {
          id: u.username,
          name: u.lastName + u.firstName,
          email: u.email,
          createdTimestamp: u.createdTimestamp,
          enabled: u.enabled,
        };
      })
    )
    .then(R.filter((u: any) => R.not(R.isNil(u.email))));

  return users;
};

export const remindsUsersProject = async () => {
  const users = await getUsers();

  const projects = await Project.find({ isArchive: false }).toArray();
  await Promise.all(
    projects.map(async (project) => {
      const leader = project.leader;
      const user = users.find((user) => user.id === leader);
      if (!user) {
        return;
      }
      const reg =
        /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
      const result = reg.exec(project._id || "");
      if (result?.groups?.projType === "SZ") {
        // 售中
        if (project.acceptDate) {
          let monthDiff = moment(project.acceptDate).diff(new Date(), "month");
          if (monthDiff === 3 && new Date().getDate() === 1) {
            const info: ProjectMailInfo = {
              email: user.email,
              projectName: project.name,
              name: user.name,
              dates: moment(new Date()).format("YYYYMMDD"),
            };
            await sendYanShouEmail(
              info,
              moment(project.acceptDate).format("YYYY-MM-DD")
            );
            console.log("发送延收提醒邮件");
          }
        }
      } else if (result?.groups?.projType === "SH") {
        if (project.startTime && project.serviceCycle) {
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 10);
          const monthDiff = moment(today).diff(project.startTime, "month");
          if (
            project.serviceCycle - monthDiff === 3 &&
            new Date().getDate() === 1
          ) {
            const info: ProjectMailInfo = {
              email: user.email,
              projectName: project.name,
              name: user.name,
              dates: moment(new Date()).format("YYYYMMDD"),
            };

            await sendWeiHuEmail(
              info,
              project.serviceCycle + "",
              moment(project.startTime).format("YYYY-MM-DD")
            );
            console.log("邮件发送完毕");
          }
        }
      }
    })
  );
  return projects;
};
