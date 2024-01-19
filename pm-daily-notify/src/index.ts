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
import { DailyInfo, UserInfo } from "./data";
import {
  transporter,
  sendEmails,
  sendWeiHuEmails,
  sendYanShouEmails,
} from "./emailer";
// console.log(moment('20240107', 'YYYYMMDD').valueOf())
const afterTimestamp = 1704556800000; //2024年1月07日的时间戳，忽略2024年1月7日之前的日报

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
    .then((users) => users.find())
    .then(
      R.map((u: any) => ({
        id: u.username,
        name: u.lastName + u.firstName,
        email: u.email,
        createdTimestamp: u.createdTimestamp,
      }))
    )
    .then(R.filter((u: any) => R.not(R.isNil(u.email))));
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
    const users = (await getUsers()).filter(
      (user) => noSendEmailList.indexOf(user.email) == -1
    );
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
          ), // 在次日期前的日报不提醒
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
//   users.forEach(user=>{
//     let projects = await getUsersProject(user)
//   })
//   .filter((mail) => R.not(R.isNil(mail.email)))
//   .filter((mail) => R.not(R.isEmpty(mail.dates)));

// }

const args = arg({ "--year": Number });
const year = args["--year"] || moment().year();
main(year);
// const today = new Date();
// const dayOfWeek = today.getDay();
// if (dayOfWeek === 1) {
//   main(year);
// }

const getUsersProject = async (user: UserInfo) => {
  const projects = await Project.find({ leader: user.id }).filter((project) => {
    const reg =
      /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
    const result = reg.exec(project.id || "");
    if (result?.groups?.projType === "SZ") {
      // 售中
      if (project.acceptDate) {
        let dayDiff = moment(project.acceptDate).diff(new Date(), "day");
        console.log(project.id + "  " + dayDiff);
        if (dayDiff == 90) {
          return true;
        }
      }
    } else if (result?.groups?.projType === "SH") {
      if (project.startTime && project.serviceCycle) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        let monthDiff = moment(today).diff(project.startTime, "month");
        let yesterdayMonthDiff = moment(yesterday).diff(
          project.startTime,
          "month"
        );
        if (
          project.serviceCycle - monthDiff <= 3 &&
          project.serviceCycle - yesterdayMonthDiff > -3
        ) {
          return true;
        }
      }
    }
  });
  return projects;
};
