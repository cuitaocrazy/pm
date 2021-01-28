import { NextFunction, Request, Response } from 'express'
import { auth } from 'express-oauth2-bearer'
import { filter, map, pipe, prop, toPairs, length, includes, assoc, unnest, pluck, xprod, slice, tail, join, applySpec, __, identity, lt, uniq, uniqBy, concat, pick, groupBy, append, last, reduce, mergeDeepWithKey } from 'ramda'
import axios, { AxiosInstance } from 'axios'
import socketio from 'socket.io'
import config from '../config/auth'
import cache from '../cache'

export type Auth = {
  token: string
  claims: any
}

export type KeycloakGroup = {id: string, name: String, path: string, subGroups?: KeycloakGroup[]}

export type UserInfo = {
  id: string,
  name: string,
  roles: string[],
  token: string,
  claims: any,
  hasPower: (roles: string[] | undefined) => boolean
  groups: string[]
}

export type AuthContext = {
  auth?: Auth
  user?: UserInfo
}

export type AuthRequest = Request & Partial<AuthContext>

export const protect = (...args: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user !== undefined) {
    if (req.user.hasPower(args)) { next() } else { res.status(403).send('未授权') }
  } else {
    res.status(401).send('访问拒绝')
  }
}

const nextFunction = (req: AuthRequest, next: (err?: any) => void) => (err?: any) => {
  if (req.auth !== undefined) {
    const id = prop<'preferred_username', string>('preferred_username')
    const givenName = prop<'given_name', string>('given_name')
    const familyName = prop<'family_name', string>('family_name')
    const name = (o: any) => ((familyName(o) || '') + (givenName(o) || '')) || id(o)
    const allRoles = (obj: any) => pipe<any, any, any>(
      prop('realm_access'),
      assoc('realm'),
    )(obj)(prop('resource_access')(obj))
    const groups = prop<'group_path', string[]>('group_path')

    const flatRoles = pipe<any, any, any, any, any, any, any, string[]>(
      allRoles,
      pluck('roles'),
      toPairs,
      map<any, any>(unnest),
      map<any, any>(s => xprod(slice<any>(0, 1, s), tail<any>(s))),
      unnest,
      map(join(':')),
    )
    const getUser = applySpec({
      id,
      name,
      roles: flatRoles,
      groups,
    })

    const user = getUser(req.auth.claims)

    const hasPower = (roles: string[] = []) => roles.length === 0
      ? true
      : pipe(map(includes(__, user.roles)), filter(identity), length, lt(0))(roles)

    req.user = { ...user, ...req.auth, hasPower }
  }
  next(err)
}

const keycloakMiddleware = auth(config)
export function authMiddleware (req: AuthRequest, res: Response, next: NextFunction) {
  const myNext: NextFunction = nextFunction(req, next)

  keycloakMiddleware(req, res, myNext)
}

export function wsAuthMiddleware (socket: socketio.Socket, next: (err?: Error) => void) {
  const req = socket.request as AuthRequest
  const myNext: NextFunction = nextFunction(req, next)

  keycloakMiddleware(req, null, myNext)
}

export function getGroupUsers (user: UserInfo) {
  const { origin, pathname } = new URL(config.issuerBaseURL)
  const keycloakAdminUrl = origin + pathname.replace('auth', 'auth/admin')
  const keycloakReqConfig = { headers: { Authorization: `Bearer ${user.token}` }, baseURL: keycloakAdminUrl }
  const groups = user.groups || []

  const inst = axios.create(keycloakReqConfig)

  // eslint-disable-next-line no-useless-escape
  const roots = uniq(groups.map(g => g.match(/^\/[^\/]+/)![0]))
  return getUserByRootGroups(roots, inst)
}

export type UserWithGroup = {
  id: string
  name: string
  groups: string[]
  email: string
}

async function getUserByRootGroups (roots:string[], fetch: AxiosInstance) {
  const users = await Promise.all(roots.map(root => getUserByRootGroup(root, fetch)))
  const concatGroups = (k: any, l: any, r: any) => k === 'groups' ? concat(r, l) : r
  return pipe<any, any, any, any, any, any>(
    unnest,
    groupBy<any>(prop('id')),
    toPairs,
    map(last),
    map(reduce(mergeDeepWithKey(concatGroups), { groups: [] })),
  )(users) as any[] as UserWithGroup[]
}

async function getUserByRootGroup (root: string, fetch: AxiosInstance) {
  let us = cache.get<UserWithGroup[]>(root)

  if (us === undefined) {
    const groupList = await getGroupList(root, fetch)
    const usersPromise = groupList.map(g => getUserByGroup(g.id, fetch).then(users => users.map(u => ({ id: u.id, name: u.name, email: u.email, groups: g.path }))))
    const users = unnest(await Promise.all(usersPromise))
    const concatGroups = (k: any, l: any, r: any) => k === 'groups' ? append(r, l) : r
    const proc = pipe(
      groupBy<any>(prop('id')),
      toPairs,
      map<any, any>(last),
      map(reduce(mergeDeepWithKey(concatGroups), { groups: [] })),
    )
    us = proc(users) as any[] as UserWithGroup[]
    cache.set(root, us)
  }

  return us || []
}

async function getGroupList (root: string, fetch: AxiosInstance) {
  function rGroupList (gs: KeycloakGroup[]): Pick<KeycloakGroup, 'id' | 'path'>[] {
    if (gs.length === 0) {
      return []
    }
    return concat(gs.map(pick(['id', 'path'])), rGroupList(unnest(gs.map(g => g.subGroups!))))
  }

  const groups = await fetch.get('/groups').then(res => res.data)
  return uniqBy(prop('id'), rGroupList(groups)).filter(g => g.path.startsWith(root))
}

async function getUserByGroup (groupId: string, fetch: AxiosInstance) {
  const getName = (d: any) => ((d.lastName || '') + (d.firstName || '')) || d.username
  const users = await fetch.get(`/groups/${groupId}/members`).then(res => res.data as any[])
  return users.map(u => ({
    id: u.username,
    name: getName(u),
    email: u.email,
  }))
}
