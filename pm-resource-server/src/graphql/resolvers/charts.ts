import { pipe, prop, includes, cond, T } from 'ramda'
import { AuthContext, UserInfo } from '../../auth/oauth'
import { Project } from '../../mongodb'
import { pool } from '../../postgres'

async function getProjectManagerCharts (leader: string, year: number) {
  const projIds = await Project.find({ leader }).map(proj => proj._id).toArray()

  const monthAmounts = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(amount)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 AND proj_id IN $2 GROUP BY yyyymm',
    [year, projIds],
  ).then(result => result.rows)

  const monthCosts = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(amount)::NUMERIC as value FROM cost_settlement WHERE yyyy = $1 AND proj_id IN $2 GROUP BY yyyymm',
    [year, projIds],
  ).then(result => result.rows)

  const monthMds = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(md)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 AND proj_id IN $2 GROUP BY yyyymm',
    [year, projIds],
  ).then(result => result.rows)

  const projCosts = await pool.query<{key: string; value: number}>(
    'SELECT proj_id as key, SUM(amount)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 AND proj_id IN $2 GROUP BY proj_id',
    [year, projIds],
  ).then(result => result.rows)

  return {
    monthAmounts,
    monthCosts,
    monthMds,
    projCosts,
    empCosts: [],
    groupCosts: [],
  }
}

async function getGroupLeaderCharts (groups: string[], year: number) {
  const monthAmounts = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(amount)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 AND emp_group IN $2 GROUP BY yyyymm',
    [year, groups],
  ).then(result => result.rows)

  const monthCosts = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(amount)::NUMERIC as value FROM cost_settlement WHERE yyyy = $1 AND emp_group IN $2 GROUP BY yyyymm',
    [year, groups],
  ).then(result => result.rows)

  const monthMds = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(md)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 AND emp_group IN $2 GROUP BY yyyymm',
    [year, groups],
  ).then(result => result.rows)

  const empCosts = await pool.query<{key: string; value: number}>(
    'SELECT emp_no as key, SUM(amount)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 AND emp_group IN $2 GROUP BY emp_no',
    [year, groups],
  ).then(result => result.rows)

  return {
    monthAmounts,
    monthCosts,
    monthMds,
    projCosts: [],
    empCosts,
    groupCosts: [],
  }
}

async function getSupervisorCharts (year: number) {
  const monthAmounts = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(amount)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 GROUP BY yyyymm',
    [year],
  ).then(result => result.rows)

  const monthCosts = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(amount)::NUMERIC as value FROM cost_settlement WHERE yyyy = $1 GROUP BY yyyymm',
    [year],
  ).then(result => result.rows)

  const monthMds = await pool.query<{key: string; value: number}>(
    'SELECT yyyymm as key, SUM(md)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 GROUP BY yyyymm',
    [year],
  ).then(result => result.rows)

  const groupCosts = await pool.query<{key: string; value: number}>(
    'SELECT emp_group as key, SUM(amount)::NUMERIC as value FROM daily_settlement WHERE yyyy = $1 GROUP BY emp_group',
    [year],
  ).then(result => result.rows)

  return {
    monthAmounts,
    monthCosts,
    monthMds,
    projCosts: [],
    empCosts: [],
    groupCosts,
  }
}

function getDeafultCharts () {
  return ({
    monthAmounts: [],
    monthCosts: [],
    monthMds: [],
    projCosts: [],
    empCosts: [],
    groupCosts: [],
  })
}

const hasRole = (role: string) => pipe<UserInfo, string[], boolean>(prop('roles'), includes(role))
const isSupervisor = hasRole('realm:supervisor')
const isGroupLeader = hasRole('realm:group_leader')
const isProjectManager = hasRole('realm:project_manager')

export default {
  Query: {
    charts: async (_: any, { year }: any, context: AuthContext) => {
      const user = context.user!
      return cond<UserInfo, any>([
        [isSupervisor, () => getSupervisorCharts(year)],
        [isGroupLeader, (user: UserInfo) => getGroupLeaderCharts(user.groups, year)],
        [isProjectManager, (user: UserInfo) => getProjectManagerCharts(user.id, year)],
        [T, getDeafultCharts],
      ])(user)
    },
  },
}
