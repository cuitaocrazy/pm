import { Server, Socket } from 'socket.io'
import http from 'http'
import { AuthRequest, getGroupUsers, UserWithGroup, wsAuthMiddleware } from '../auth/oauth'
import { applySpec, differenceWith, map, prop } from 'ramda'
import '../postgres'
import { addSettledMonth, clearSettledDatas, existSettledMonth, getCostFromData, getCostSettlementDatas, getDailySettlementDatas, saveCostSettlementDates, saveDailySettlementDates } from './settle'

const checkSettleMonth = async (month: string) => {
  const exist = await existSettledMonth(month)
  if (exist) {
    return { pass: false, msg: `${month}已结算` }
  }
  return { pass: true, msg: '' }
}

type UserIDAndName = {
  id: string,
  name: string
}

const checkUsers = (usersFromData: UserIDAndName[], usersFromServer: UserIDAndName[]) => {
  const check = (left: UserIDAndName[], right: UserIDAndName[]) => {
    const ret = differenceWith((a, b) => a.id === b.id, left, right)
    return {
      pass: ret.length === 0,
      data: ret,
    }
  }

  const formatData = (d: UserIDAndName[]) => d.map(u => `员工号[${u.id}]-姓名[${u.name}]`).join(' ')

  let err = check(usersFromData, usersFromServer)
  const errMsg: string[] = []
  if (!err.pass) {
    errMsg.push('来自客户端的数据多出' + formatData(err.data))
  }

  err = check(usersFromServer, usersFromData)
  if (!err.pass) {
    errMsg.push('服务端端的数据多出' + formatData(err.data))
  }

  return { pass: errMsg.length === 0, msg: errMsg.join('\n') }
}

const getUsersIdAndNameByData = (rows: (string | number)[][]) => {
  const u = {
    id: prop<any, string>(0),
    name: prop<any, string>(5),
  }
  return map<any, UserIDAndName>(applySpec(u), rows)
}

const getUserIdAndNameByServer = (users: UserWithGroup[]) => {
  const u = {
    id: prop<any, string>('id'),
    name: prop<any, string>('name'),
  }
  return map<any, UserIDAndName>(applySpec(u), users)
}

export default (s: http.Server) => {
  const io = new Server(s, {
    path: '/api/socket.io',
  })

  const settlementIo = io.of('/settlement')
  settlementIo.use(wsAuthMiddleware)

  settlementIo.on('connect', (socket: Socket) => {
    const req = socket.request as AuthRequest
    const clientLog = (msg: string) => socket.emit('log', msg)
    if (req.user === undefined || !req.user.hasPower(['realm:supervisor'])) {
      clientLog('没有主管权限')
      socket.disconnect()
    } else {
      const ask = (msg: string) => new Promise((resolve) => {
        socket.emit('ask', msg, resolve)
      })

      socket.on('data', async (data, cb) => {
        try {
          clientLog('接收到数据')
          if (data.length === 0) {
            clientLog('接收到的数据不能为空')
            const msg = '已停止结算'
            cb(msg)
            return
          }
          const settlementMonth = data[0][1]
          clientLog(`文件结算年月为: ${settlementMonth}`)
          clientLog('检查人员...')
          const users = await getGroupUsers(req.user!)
          let ret = checkUsers(getUsersIdAndNameByData(data), getUserIdAndNameByServer(users))
          if (!ret.pass) {
            clientLog(ret.msg)
            const proceed = await ask(ret.msg + '\n是否继续?')
            if (!proceed) {
              const msg = '已停止结算'
              cb(msg)
              return
            }
          }
          ret = await checkSettleMonth(settlementMonth)

          if (!ret.pass) {
            clientLog(ret.msg)
            const proceed = await ask(ret.msg + '\n是否重新结算?')
            if (!proceed) {
              const msg = '已停止结算'
              cb(msg)
              return
            }
            clientLog(`开始清理${settlementMonth}结算数据`)
            clearSettledDatas(settlementMonth)
            clientLog('数据清理完毕')
          }

          clientLog('更新结算月列表')
          addSettledMonth(settlementMonth)
          clientLog('结算日报...')
          const dailySettlementDatas = await getDailySettlementDatas(users, settlementMonth, data.map(d => ({ id: d[0], cost: getCostFromData(d) })))
          clientLog(`共${dailySettlementDatas.length}数据`)
          clientLog('保存日报结算...')
          await saveDailySettlementDates(dailySettlementDatas)
          clientLog('日报结算完毕')
          clientLog('结算费用...')
          const costSettlementDatas = await getCostSettlementDatas(users, settlementMonth)
          clientLog(`共${costSettlementDatas.length}数据`)
          clientLog('保存费用结算...')
          await saveCostSettlementDates(costSettlementDatas)
          clientLog('费用结算完毕')
          const msg = '结算完毕'
          cb(msg)
        } catch (e) {
          clientLog(e.toString())
        }
      })
    }
  })
}
