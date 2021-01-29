import arg from 'arg'
import * as R from 'ramda'
import { Config, EmployeeDaily, IEmployeeDaily, client } from './mongodb'
import { Users } from './keycloak'
import { getWorkDays } from './util/utils'
import { DailyInfo, UserInfo } from './data'
import { transporter, sendEmails } from './emailer'

const getConfigData = async (configId: string): Promise<string[]> => {
  const config = await Config.findOne({ _id: configId })
  return R.isNil(config)
    ? []
    : config.data
}

const getEmpDailiesData = async (year: string): Promise<IEmployeeDaily[]> => {
  const dailies = await EmployeeDaily.aggregate([
    {
      $project: {
        _id: 1,
        dailies: {
          $filter: {
            input: '$dailies',
            as: 'd',
            cond: { $regexMatch: { input: '$$d.date', regex: `^${year}.*` } },
          },
        },
      },
    },
  ]).toArray()
  if (R.isEmpty(dailies)) {
    return []
  } else {
    return dailies
  }
}

export const getUsers = async (): Promise<UserInfo[]> => {
  const users = await Users()
    .then(users => users.find())
    .then(R.map((u: any) => ({ id: u.username, name: u.lastName + u.firstName, email: u.email })))
    .then(R.filter((u: any) => R.not(R.isNil(u.email))))
  return users
}

export const getNoDailyDates = (workdays: string[], dailies: DailyInfo[]) =>
  workdays.filter(date => R.isNil(R.find(R.propEq('date', date), dailies)))

async function main (year: number) {
  try {
    const workCalendar = await getConfigData('workCalendar')
    const empDailies = await getEmpDailiesData(`${year}`)

    const users = await getUsers()
    const mails = users.map(user => ({
      name: user.name,
      email: user.email,
      dates: getNoDailyDates(getWorkDays(year, workCalendar), R.find(R.propEq('_id', user.id), empDailies)?.dailies || []),
    }))

    const verify = await transporter.verify()
    if (verify) {
      sendEmails(mails)
    } else {
      console.error('Verifies SMTP configuration failed!')
    }
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
}

const args = arg({ '--year': Number })
const year = args['--year'] || 2021

main(year)
