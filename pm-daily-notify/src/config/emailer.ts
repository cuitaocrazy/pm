export default {
  host: process.env.EMAIL_HOST || "localhost",
  port: process.env.EMAIL_PORT || 1025,
  user: process.env.EMAIL_USER || "project.1",
  password: process.env.EMAIL_PASSWORD || "secret.1",
  // host: "smtp.263.net",
  // port: 465,
  // user: "miao.zhou@bjyada.com",
  // password: "P@",
  subject: process.env.EMAIL_SUBJECT || "日报未提交通知",
  yanShouSubject: process.env.EMAIL_YANSHOU_SUBJECT || "验收时间提醒通知",
  weiHuSubject: process.env.EMAIL_WEIHU_SUBJECT || "维护时间提醒通知",
};
