import KcAdminClient from 'keycloak-admin'
import config from '../config/keycloak'

export const client = new KcAdminClient({
  baseUrl: config.baseUrl,
  realmName: config.realmName,
})

export const Users = async () => {
  await client.auth({
    grantType: 'password',
    username: config.username,
    password: config.password,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  })
  return client.users
}
