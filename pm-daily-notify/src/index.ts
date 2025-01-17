import arg from "arg";
import * as R from "ramda";
import moment from "moment";
import {
  Config,
  EmployeeDaily,
  IEmployeeDaily,
  client,
  Project,
} from "./mongodb";
import { Users } from "./keycloak";
import { getWorkDays } from "./util/utils";
import { DailyInfo, ProjectMailInfo, UserInfo } from "./data";
import {
  transporter,
  sendEmails,
  sendWeiHuEmail,
  sendYanShouEmail,
  closeTransporter,
} from "./emailer";
import { remindsUsersProject } from "./remind";
// console.log(moment('20240107', 'YYYYMMDD').valueOf())
const afterTimestamp = 1704556800000; //2024年1月07日的时间戳，忽略2024年1月7日之前的日报
const today = moment().format("YYYYMMDD"); // 获取当前日期并格式化为 YYYYMMDD 
process.env.TZ = 'Asia/Shanghai'
const getConfigData = async (configId: string): Promise<string[]> => {
  const config = await Config.findOne({ _id: configId });
  return R.isNil(config) ? [] : config.data;
};

const getEmpDailiesData = async (year: string): Promise<IEmployeeDaily[]> => {
  const dailies = await EmployeeDaily.aggregate([
    {
      $project: {
        _id: 1,
        dailies: {
          $filter: {
            input: "$dailies",
            as: "d",
            cond: { $regexMatch: { input: "$$d.date", regex: `^${year}.*` } },
          },
        },
      },
    },
  ]).toArray();
  if (R.isEmpty(dailies)) {
    return [];
  } else {
    return dailies;
  }
};

export const getUsers = async (): Promise<UserInfo[]> => {
  const users = await Users()
    .then(async (users) => {
      let users_ = await users.find()
      const usersWithRoles = await Promise.all(
        users_.map(async (user) => {
        const realmRoles = await users.listRealmRoleMappings({ id: user.id! });
        return {
          ...user,
          realmRoles,
        };
        })
      );
      return usersWithRoles;
    })
    .then(
      R.map((u: any) => ({
        id: u.username!,
        name: u.lastName + u.firstName,
        email: u.email,
        createdTimestamp: u.createdTimestamp,
        enabled: u.enabled,
        realmRoles:u.realmRoles ?? [],
      }))
    )
    .then(R.filter((u: any) =>  R.not(R.isNil(u.email)) && !R.any(R.propEq('name', 'no_notification'))(u.realmRoles)));
    console.dir(users,{depth:null})
  return users;
};

export const getNoDailyDates = (workdays: string[], dailies: DailyInfo[]) =>
  workdays.filter((date) => R.isNil(R.find(R.propEq("date", date), dailies)));

async function main(year: number) {
  try {
    const workCalendar = await getConfigData("workCalendar");
    const empDailies = await getEmpDailiesData(`${year}`);
    const noSendEmailList = [
      "na.yang@bjyada.com",
      "shujian.du@bjyada.com",
      "yong.zhang@bjyada.com",
      "jiabin.fan@bjyada.com",
      "fengming.jiang@bjyada.com",
      "kunhao.hou@bjyada.com",
    ];
    const users = (await getUsers())
      .filter((user) => noSendEmailList.indexOf(user.email) == -1)
      .filter((user) => user.enabled);
    const mails = users
      .map((user) => ({
        name: user.name,
        email: user.email,
        dates: getNoDailyDates(
          getWorkDays(year, workCalendar),
          R.find(R.propEq("_id", user.id), empDailies)?.dailies || []
        )
          .filter(
            (date) =>
              R.isNil(user.createdTimestamp) ||
              moment(date, "YYYYMMDD").isAfter(moment(user.createdTimestamp))
          )
          .filter((date) =>
            moment(date, "YYYYMMDD").isAfter(moment(afterTimestamp))
          )// 在次日期前的日报不提醒
           .filter((date) =>  
            !moment(date, "YYYYMMDD").isSame(today, 'day') // 排除当前日期  
          ), 
      }))
      .filter((mail) => R.not(R.isNil(mail.email)))
      .filter((mail) => R.not(R.isEmpty(mail.dates)));

    const verify = await transporter.verify();
    if (verify) {
      sendEmails(mails);
    } else {
      console.error("Verifies SMTP configuration failed!");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

// async function sendProjectRemind(today: string) {
//   const users = await getUsers();
//   const mails = [];

//   users
//     .forEach(async (user) => {
//       let userProjects = await getUsersProject(user);
//       userProjects.map(async (project) => {
//           if(project._id)
//       });
//     })
//     .filter((mail) => R.not(R.isNil(mail.email)))
//     .filter((mail) => R.not(R.isEmpty(mail.dates)));
// }

const args = arg({ "--year": Number });
const year = args["--year"] || moment().year();
if (new Date().getDay() === 1) {
  main(year);
}

remindsUsersProject().then(() => {
  // closeTransporter();
  setTimeout(() => {
    console.log("发送完毕，关闭邮箱");
    closeTransporter();
    process.exit(0)
    // Promise.reject(new Error("结束"));
  }, 3600 * 1000);
});
