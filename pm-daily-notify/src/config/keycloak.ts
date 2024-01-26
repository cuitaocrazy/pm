export default {
  baseUrl: process.env.KEYCLOAK_BASE_URL || 'https://keycloak.yadashuke.com/auth',
  realmName: process.env.KEYCLOAK_REALM_NAME || 'pm',
  grantType: process.env.KEYCLOAK_GRANT_TYPE || 'client_credentials',
  username: process.env.KEYCLOAK_USERNAME || '',
  password: process.env.KEYCLOAK_PASSWORD || '',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'pm-dn',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '01110e3d-00c6-4145-a650-161a2315d0ef',
}
