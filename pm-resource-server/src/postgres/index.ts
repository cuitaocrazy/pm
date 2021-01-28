import { Client } from 'pg'
import config from '../config/postgresql'

const client = new Client(config as any)
client.connect().then(console.log)
