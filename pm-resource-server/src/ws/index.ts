import { Server, Socket } from 'socket.io'
import http from 'http'
import { AuthRequest, getGroupUsers, UserWithGroup, wsAuthMiddleware } from '../auth/oauth'
import { applySpec, differenceWith, includes, map, prop, defaultTo } from 'ramda'
import '../postgres'
import { Config } from '../mongodb'

const checkSettleMonth = async (month: string) => {
  const settledMonths = defaultTo([], (await Config.findOne({ _id: 'settleMonth' }))?.data)
  if (includes(month, settledMonths)) {
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
        clientLog('接收到数据')
        if (data.length === 0) {
          clientLog('接收到的数据不能为空')
          const msg = '已停止结算'
          cb(msg)
          return
        }
        clientLog(`文件结算年月为: ${data[0][1]}`)
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
        ret = await checkSettleMonth(data[0][1])

        if (!ret.pass) {
          clientLog(ret.msg)
          const proceed = await ask(ret.msg + '\n是否重新结算?')
          if (!proceed) {
            const msg = '已停止结算'
            cb(msg)
            return
          }
        }
        clientLog('结算日报...')
        clientLog('结算费用...')
        const msg = '结算完毕'
        cb(msg)
      })
    }
  })
}
