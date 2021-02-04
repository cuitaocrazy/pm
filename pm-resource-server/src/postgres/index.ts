import { Pool } from 'pg'
import config from '../config/postgresql'

export const pool = new Pool(config as any)
