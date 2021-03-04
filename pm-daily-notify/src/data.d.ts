import { ProjDaily } from './mongodb'

export interface DailyInfo {
  date: string
  projs: ProjDaily[]
}

export interface UserInfo {
  id: string
  name: string
  email: string
  createdTimestamp: number
}

export interface MailInfo {
  name: string
  email: string
  dates: string[]
}
