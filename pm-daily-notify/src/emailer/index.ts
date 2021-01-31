import * as R from 'ramda'
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
    pass: config.pass,
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
      text: R.join('|', info.dates),
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
