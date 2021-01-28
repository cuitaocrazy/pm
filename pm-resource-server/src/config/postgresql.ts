export default {
  user: process.env.PGUSER || 'pm',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'pm',
  password: process.env.PGPASSWORD || 'pm',
  port: process.env.PGPORT || 5432,
}
