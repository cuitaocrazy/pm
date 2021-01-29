import moment from 'moment'
import * as R from 'ramda'

/**
 * 判断是否是周末
 * @param date 格式为YYYYMMDD的字符串
 */
export const isWeekend = (date: string): boolean => R.includes(
  moment(date, 'YYYYMMDD').weekday(),
  [moment().day(6).weekday(), moment().day(0).weekday()],
)

/**
 * 判断是否是工作日
 * @param date 格式为YYYYMMDD的字符串
 * @param workCalendar 工作日历
 */
export const isWorkday = (date: string, workCalendar: string[]): boolean => R.or(
  R.and(isWeekend(date), R.includes(date, workCalendar)),
  R.and(R.not(isWeekend(date)), R.not(R.includes(date, workCalendar))),
)

/**
 * 获取某个年份的所有工作日
 * @param year 年份
 * @param workCalendar 工作日历
 */
export const getWorkDays = (year: number, workCalendar: string[]) => {
  const curDate = moment()
  const monthLen = R.equals(year, curDate.year()) ? curDate.month() + 1 : 12
  const months = R.range(0, monthLen)
    .map(i => moment().year(year).month(i))
  const dates = R.unnest(
    months.map(month =>
      R.range(1, R.equals(curDate.format('YYYYMM'), month.format('YYYYMM')) ? curDate.date() : 32)
        .map(i => moment(month).date(i).format('YYYYMMDD'))
        .filter(date => isWorkday(date, workCalendar)),
    ),
  )
  return dates
}
