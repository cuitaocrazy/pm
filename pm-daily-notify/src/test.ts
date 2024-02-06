import moment from "moment";
import { getWorkDays } from "./util/utils";
import { Users } from "./keycloak";
import { DailyInfo, ProjectMailInfo, UserInfo } from "./data";
import { Project } from "./mongodb";
import * as R from "ramda";
import { remindsUsersProject } from "./remind";

import {
  transporter,
  sendEmails,
  sendWeiHuEmail,
  sendYanShouEmail,
  closeTransporter,
} from "./emailer";



remindsUsersProject().then(() => {
  // closeTransporter();

  setTimeout(() => {
    console.log("发送完毕，关闭邮箱");
    closeTransporter();
    process.exit(0)
    // Promise.reject(new Error("结束"));
  }, 1 * 1000);
});
