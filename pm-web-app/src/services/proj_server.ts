// import { request } from 'umi';
import axios from 'axios';

export interface Project {
  id: string;
  name: string;
}

export interface SimpleUser {
  id: string;
  name: string;
}

export interface ReportContent {
  projId: string;
  projName: string;
  timeConsuming: number;
  contentOfWork: string;
}

export interface ReportData {
  date: string;
  projs: ReportContent[];
}

export async function getAllSimpleUsers() {
  return axios.get<SimpleUser[]>('/api/simple_users').then((r) => r.data);
}

export async function getSelfProjs() {
  return axios.get<Project[]>('/api/self/projs').then((r) => r.data);
}

export async function updateSelfReport(data: ReportData) {
  return axios.put(`/api/self/report/${data.date}/`, { ...data, date: undefined });
}

export async function getSelfLastReport(maxDate: string) {
  return axios
    .get<Pick<ReportData, 'projs'>>(`/api/self/report/latest?maxDate=${maxDate}`)
    .then((r) => r.data);
}

export async function getSelfAllReport() {
  return axios.get<ReportData[]>(`/api/self/report/`).then((r) => r.data);
}

export async function getSelfReportBy(date: string) {
  return axios
    .get<(ReportData & { id: string }) | undefined>(`/api/self/report/${date}/`)
    .then((r) => r.data)
    .catch((reason: { response: Response }) => {
      if (reason.response.status === 404) return undefined;
      /* eslint-disable @typescript-eslint/no-throw-literal */
      throw reason;
    });
}

export async function getDayListOfSelfReportBy(month: string) {
  return axios.get<string[]>(`/api/self/report/days?beginMonth=${month}`).then((r) => r.data);
}
