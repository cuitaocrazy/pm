import * as R from "ramda";
import moment from "moment";
import { createTransport } from "nodemailer";
import { MailInfo, ProjectMailInfo } from "../data";
import config from "../config/emailer";

export const transporter = createTransport({
  pool: true,
  logger: true,
  host: config.host,
  port: config.port as number,
  auth: {
    user: config.user,
    pass: config.password,
  },
});

/**
 * 使用Promise.al时会导致部分发送失败,改为递归发送
 * @param infos 需要发送邮件的信息数组
 */
export const sendEmails = (infos: MailInfo[]) => {
  if (infos.length > 0) {
    const info = infos[0];
    transporter.sendMail(
      {
        from: config.user, // Sender address
        to: info.email, // List of recipients
        subject: config.subject, // Subject line
        html: genEmailHtml({
          name: info.name,
          dates: R.join(
            "",
            R.map(
              (date) =>
                `<li>${moment(date, "YYYYMMDD").format("YYYY-MM-DD")}</li>`,
              info.dates
            )
          ),
        }),
      },
      (err) => {
        if (err) {
          console.log(err, info);
          sendEmails(R.append(info, R.tail(infos)));
        } else {
          sendEmails(R.tail(infos));
        }
      }
    );
  } else {
    // transporter.close();
  }
};

const template = `<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<body>
<h3>{{name}}</h3>
<h3>你在下列工作日中没有提交日报，请尽快去补全提交</h3>
{{dates}}
<br>
<a href="https://pm.yadashuke.com/redirect/dailies">去补全日报</a>
</body>
</html>`;

const genEmailHtml = (args: { [key: string]: string }) => {
  const html = R.keys(args).reduce(
    (temp: string, key) => R.replace(`{{${key}}}`, args[key], temp),
    template
  );
  return html;
};

const yanShouTemplate = `<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<body>
<h3>{{name}}</h3>
<h3>项目{{projectName}}验收日期不足三个月，请及时签署维护合同</h3>
验收日期：{{acceptDate}}
<br>
</body>
</html>`;

const genYanShouEmailHtml = (args: { [key: string]: string }) => {
  const html = R.keys(args).reduce(
    (temp: string, key) => R.replace(`{{${key}}}`, args[key], temp),
    yanShouTemplate
  );
  return html;
};

/**
 * 使用Promise.al时会导致部分发送失败,改为递归发送
 * @param infos 需要发送邮件的信息数组
 */
export const sendYanShouEmail = (info: ProjectMailInfo, acceptDate: string) => {
  transporter.sendMail(
    {
      from: config.user, // Sender address
      to: info.email, // List of recipients
      subject: config.yanShouSubject || "验收时间提醒通知", // Subject line
      html: genYanShouEmailHtml({
        name: info.name,
        projectName: info.projectName,
        acceptDate,
        // dates: R.join(
        //   "",
        //   R.map(
        //     (date) =>
        //       `<li>${moment(date, "YYYYMMDD").format("YYYY-MM-DD")}</li>`,
        //     info.dates
        //   )
        // ),
      }),
    },
    (err) => {
      if (err) {
        console.log(err, info);
        sendYanShouEmail(info, acceptDate);
      }
    }
  );
  // transporter.close();
};

const weiHuTemplate = `<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<body>
<h3>{{name}}</h3>
<h3>项目--{{projectName}}--维护服务即将不足三个月，请及时巡检</h3>
项目维护周期{{serviceCycle}}月，项目开始时间{{startTime}}
<br>
</body>
</html>`;

const genWeiHuEmailHtml = (args: { [key: string]: string }) => {
  const html = R.keys(args).reduce(
    (temp: string, key) => R.replace(`{{${key}}}`, args[key], temp),
    weiHuTemplate
  );
  return html;
};

/**
 * 使用Promise.al时会导致部分发送失败,改为递归发送
 * @param infos 需要发送邮件的信息数组
 */
export const sendWeiHuEmail = (
  info: ProjectMailInfo,
  serviceCycle: string,
  startTime: string
) => {
  transporter.sendMail(
    {
      from: config.user, // Sender address
      to: info.email, // List of recipients
      subject: config.weiHuSubject || "维护时间提醒通知", // Subject line
      html: genWeiHuEmailHtml({
        name: info.name,
        projectName: info.projectName,
        serviceCycle,
        startTime,
      }),
    },
    (err) => {
      if (err) {
        console.log(err, info);
        sendWeiHuEmail(info, serviceCycle, startTime);
      }
    }
  );
};

export const closeTransporter = () => {
  transporter.close();
};
