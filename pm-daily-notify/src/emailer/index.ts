import * as R from 'ramda'
import moment from 'moment'
import { createTransport } from 'nodemailer'
import { MailInfo } from '../data'
import config from '../config/emailer'

export const transporter = createTransport({
  pool: true,
  logger: true,
  host: config.host,
  port: config.port as number,
  auth: {
    user: config.user,
    pass: config.password,
  },
})

/**
 * 使用Promise.al时会导致部分发送失败,改为递归发送
 * @param infos 需要发送邮件的信息数组
 */
export const sendEmails = (infos: MailInfo[]) => {
  if (infos.length > 0) {
    const info = infos[0]
    transporter.sendMail({
      from: config.user, // Sender address
      to: info.email, // List of recipients
      subject: config.subject, // Subject line
      html: genEmailHtml({
        name: info.name,
        dates: R.join('', R.map(date => `<li>${moment(date, 'YYYYMMDD').format('YYYY-MM-DD')}</li>`, info.dates)),
      }),
    }, (err) => {
      if (err) {
        console.log(err, info)
        sendEmails(R.append(info, R.tail(infos)))
      } else {
        sendEmails(R.tail(infos))
      }
    })
  } else {
    transporter.close()
  }
}

const template = `<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<body>
<h3>{{name}}</h3>
<h3>你在下列工作日中没有提交日报，请尽快去补全提交</h3>
{{dates}}
<br>
<a href="https://pm.lanxinpay.com/redirect/dailies">去补全日报</a>
</body>
</html>`

const genEmailHtml = (args: { [key: string]: string }) => {
  const html = R.keys(args).reduce((temp: string, key) => R.replace(`{{${key}}}`, args[key], temp), template)
  return html
}
