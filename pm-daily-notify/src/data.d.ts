import { ProjDaily } from "./mongodb";

export interface DailyInfo {
  date: string;
  projs: ProjDaily[];
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  createdTimestamp: number;
  enabled: boolean;
}

export interface MailInfo {
  name: string;
  email: string;
  dates: string[];
}
export interface ProjectMailInfo {
  name: string;
  email: string;
  dates: string;
  projectName: string;
}
