export default {
  host: process.env.EMAIL_HOST || 'localhost',
  port: process.env.EMAIL_PORT || 1025,
  user: process.env.EMAIL_USER || 'project.1',
  password: process.env.EMAIL_PASSWORD || 'secret.1',
  subject: process.env.EMAIL_SUBJECT || '日报未提交通知',
}
