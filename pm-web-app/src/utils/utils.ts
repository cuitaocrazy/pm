import moment from 'moment';
import * as R from 'ramda';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

/**
 * 判断是否是周末
 * @param date 格式为YYYYMMDD的字符串
 */
export const isWeekend = (date: string): boolean => R.includes(
  moment(date, 'YYYYMMDD').weekday(),
  [moment().day("星期六").weekday(), moment().day("星期日").weekday()]
)

/**
 * 判断是否是工作日
 * @param date 格式为YYYYMMDD的字符串
 * @param workCalendar 工作日历
 */
export const isWorkday = (date: string, workCalendar: string[]): boolean => R.or(
  R.and(isWeekend(date), R.includes(date, workCalendar)),
  R.and(R.not(isWeekend(date)), R.not(R.includes(date, workCalendar)))
)
