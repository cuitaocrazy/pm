import { append, map, pipe, uniq, unnest } from 'ramda'
import { UserWithGroup } from '../auth/oauth'
import { Config, Cost, EmployeeDaily } from '../mongodb'
import { pool } from '../postgres'

async function getDailyDetail (month: string) {
  return EmployeeDaily.aggregate([
    {
      $project: {
        dailies: {
          $filter: {
            input: '$dailies',
            as: 'd',
            cond: { $and: [{ $eq: [{ $substr: ['$$d.date', 0, 6] }, month] }, { $ne: [{ $sum: '$$d.projs.timeConsuming' }, 0] }] },
          },
        },
      },
    },
    {
      $addFields: {
        days: { $size: '$dailies' },
      },
    },
    { $unwind: '$dailies' },
    {
      $project: {
        _id: 0,
        id: '$_id',
        date: '$dailies.date',
        days: '$days',
        projs: {
          $map: {
            input: '$dailies.projs',
            as: 'ps',
            in: {
              projId: '$$ps.projId',
              timeConsuming: '$$ps.timeConsuming',
              content: '$$ps.content',
              md: {
                $divide: ['$$ps.timeConsuming', { $sum: '$dailies.projs.timeConsuming' }],
              },
            },
          },
        },
      },
    },
    { $unwind: '$projs' },
    {
      $lookup: {
        from: 'projects',
        localField: 'projs.projId',
        foreignField: '_id',
        as: 'projectDetail',
      },
    },
    {
      $addFields: {
        projectDetail: { $first: '$projectDetail' },
      },
    },
    {
      $project: {
        emp_no: '$id',
        proj_id: '$projs.projId',
        proj_name: '$projectDetail.name',
        proj_type: '$projectDetail.type',
        leader_no: '$projectDetail.leader',
        daily_date: '$date',
        daily_content: '$projs.content',
        md: '$projs.md',
        time_consuming: '$projs.timeConsuming',
        work_days_of_month: '$days',
      },
    },
  ]).toArray() as Promise<any[]>
}

async function getCostDetail (month: string) {
  return Cost.aggregate([
    {
      $match: { createDate: { $regex: new RegExp(`^${month}`) } },
    },
    {
      $unwind: '$projs',
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'projs.id',
        foreignField: '_id',
        as: 'projectDetail',
      },
    },
    {
      $addFields: {
        projectDetail: { $first: '$projectDetail' },
      },
    },
    {
      $project: {
        _id: 0,
        emp_no: '$participant',
        proj_id: '$projs.id',
        proj_name: '$projectDetail.name',
        proj_type: '$projectDetail.type',
        leader_no: '$projectDetail.leader',
        cost_date: '$createDate',
        cost_type: '$projs.type',
        cost_description: '$projs.description',
        amount: '$projs.amount',
      },
    },
  ]).toArray() as Promise<any[]>
}

export async function getDailySettlementDatas (users: UserWithGroup[], settlementMonth: string, userCosts: { id: string, cost: number }[]) {
  const getUser = (id: string) => users.find(u => u.id === id)
  const getAmount = (id: string) => userCosts.find(u => u.id === id)?.cost
  const dailies = await getDailyDetail(settlementMonth)
  const dailySettlementDatas = dailies.map(daily => {
    const user = getUser(daily.emp_no)
    const leader = getUser(daily.leader_no)
    const amount = getAmount(daily.emp_no) || 0
    return { ...daily, emp_group: user?.groups[0], emp_name: user?.name, leader_group: leader?.groups[0], leader_name: leader?.name, settle_month: settlementMonth, amount: amount * daily.md / daily.work_days_of_month }
  })
  return dailySettlementDatas
}

export async function getCostSettlementDatas (users: UserWithGroup[], settlementMonth: string) {
  const getUser = (id: string) => users.find(u => u.id === id)
  const costs = await getCostDetail(settlementMonth)
  return costs.map(cost => {
    const user = getUser(cost.emp_no)
    const leader = getUser(cost.leader_no)
    return { ...cost, emp_group: user?.groups[0], emp_name: user?.name, leader_group: leader?.groups[0], leader_name: leader?.name, settle_month: settlementMonth }
  })
}

export function getCostFromData (dataRow: any[]) {
  return dataRow[14] + dataRow[34] + dataRow[35] + dataRow[36] + dataRow[37] + dataRow[38] + dataRow[39] + dataRow[40] + dataRow[41]
}
async function getSettledMonths () {
  return (await Config.findOne({ _id: 'settledMonths' }))?.data as string[] || []
}

export async function addSettledMonth (settledMonth: string) {
  const settledMonths = await getSettledMonths()
  return Config.updateOne({ _id: 'settledMonths' }, { $set: { data: uniq(append(settledMonth, settledMonths)) } }, { upsert: true })
}

export async function existSettledMonth (settlementMonth: string) {
  const months = await getSettledMonths()
  return months.includes(settlementMonth)
}

export async function clearSettledDatas (settlementMonth: string) {
  await pool.query('DELETE FROM daily_settlement WHERE settle_month = $1', [settlementMonth])
  await pool.query('DELETE FROM cost_settlement WHERE settle_month = $1', [settlementMonth])
}

// https://github.com/brianc/node-postgres/issues/957
function expand (rowCount, columnCount, startAt = 1) {
  let index = startAt
  return Array(rowCount).fill(0).map(v => `(${Array(columnCount).fill(0).map(v => `$${index++}`).join(', ')})`).join(', ')
}

export async function saveDailySettlementDates (datas: any[]) {
  if (datas.length === 0) return
  const rowCount = datas.length
  const columnCount = 16
  const getRowArray = (o: any) => [
    o.emp_group,
    o.emp_no,
    o.emp_name,
    o.proj_id,
    o.proj_name,
    o.proj_type,
    o.leader_group,
    o.leader_no,
    o.leader_name,
    o.settle_month,
    o.daily_date,
    o.daily_content,
    o.time_consuming,
    o.md,
    o.amount,
    o.work_days_of_month,
  ]
  const transalte = pipe(map(getRowArray), unnest)
  await pool.query(`INSERT INTO daily_settlement VALUES ${expand(rowCount, columnCount)}`, transalte(datas))
}

export async function saveCostSettlementDates (datas: any[]) {
  if (datas.length === 0) return
  const rowCount = datas.length
  const columnCount = 14
  const getRowArray = (o: any) => [
    o.emp_group,
    o.emp_no,
    o.emp_name,
    o.proj_id,
    o.proj_name,
    o.proj_type,
    o.leader_group,
    o.leader_no,
    o.leader_name,
    o.settle_month,
    o.cost_date,
    o.cost_type,
    o.cost_description,
    o.amount,
  ]
  const transalte = pipe(map(getRowArray), unnest)
  await pool.query(`INSERT INTO cost_settlement VALUES ${expand(rowCount, columnCount)}`, transalte(datas))
}
