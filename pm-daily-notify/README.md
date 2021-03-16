# 未写日报邮件通知  

## 获取keycloak的client配置  

### 创建keycloak的client
- 登陆keycloak在pm的relm下创建clientId[pm-dn]  
- 设置client的[Access Type]属性为[confidential]  
- 设置[Service Account Roles]  
  添加[Client Roles]中[account]下的[manage-account]角色

### 项目keycloak相关配置  
  项目中使用keycloak提供的[Node.js Keycloak admin client](https://www.npmjs.com/package/keycloak-admin)  

- grantType  
   keycloak的授权类型使用[client_credentials]

## 邮件发送配置  

### 项目邮件发送配置  
  项目中使用[nodemailer](https://www.npmjs.com/package/nodemailer)发送邮件，nodemailer提供了一个模拟的邮件服务器用来测试

### 测试环境邮件发送
  可以使用nodemailer提供的[app](https://nodemailer.com/app/)作为邮件服务器供测试环境使用