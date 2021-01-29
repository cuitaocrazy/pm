export default {
  baseUrl: process.env.KEYCLOAK_BASE_URL || 'https://keycloak.yadadev.com/auth',
  realmName: process.env.KEYCLOAK_REALM_NAME || 'pm',
  grantType: process.env.KEYCLOAK_GRANT_TYPE || 'password' as string,
  username: process.env.KEYCLOAK_USERNAME || 'admin',
  password: process.env.KEYCLOAK_PASSWORD || 'pwd',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'pm-dn',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '5aab9483-d13d-4416-95ee-a5925a09def1',
}
