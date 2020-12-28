import { NextFunction, Request, Response } from 'express'
import { auth } from 'express-oauth2-bearer'
import { filter, map, pipe, prop, toPairs, length, includes, assoc, unnest, pluck, xprod, slice, tail, join, applySpec, __, identity, lt, uniq, uniqBy, sortBy } from 'ramda'
import axios from 'axios'
import config from '../config/auth'

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

const keycloakMiddleware = auth(config)
export function authMiddleware (req: AuthRequest, res: Response, next: NextFunction) {
  const myNext: NextFunction = (err?: any) => {
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

      const plantRoles = pipe<any, any, any, any, any, any, any, string[]>(
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
        roles: plantRoles,
        groups,
      })

      const user = getUser(req.auth.claims)

      const hasPower = (roles: string[] = []) => roles.length === 0
        ? true
        : pipe(map(includes(__, user.roles)), filter(identity), length, lt(0))(roles)

      getGroupUsers({ ...user, ...req.auth, hasPower })
      req.user = { ...user, ...req.auth, hasPower }
    }
    next(err)
  }

  keycloakMiddleware(req, res, myNext)
}

export function getGroupUsers (user: UserInfo) {
  const keycloakReqConfig = { headers: { Authorization: `Bearer ${user.token}` } }
  const groups = user.groups || []
  const { origin, pathname } = new URL(config.issuerBaseURL)
  const keycloakAdminUrl = origin + pathname.replace('auth', 'auth/admin')
  const inst = axios.create(keycloakReqConfig)
  const groupUrl = keycloakAdminUrl + '/groups'
  const getGroupIds: (roots: string[], gs: KeycloakGroup[]) => string[] = (roots: string[], gs: KeycloakGroup[]) => unnest(gs.map(g => {
    if (roots.filter(r => g.path.startsWith(r)).length > 0) { return [g.id, ...getGroupIds(roots, g.subGroups!)] } else { return [] }
  }))
  const getName = (d: any) => ((d.lastName || '') + (d.firstName || '')) || d.username
  // eslint-disable-next-line no-useless-escape
  return inst.get(groupUrl).then(res => getGroupIds(uniq(groups.map(g => g.match(/^\/[^\/]+/)![0])), res.data).map(id => groupUrl + `/${id}/members`))
    .then(urls => Promise.all(urls.map(url => inst.get(url).then(res => res.data.map(d => ({ id: d.username, name: getName(d) }))))))
    .then(unnest)
    .then(uniqBy(prop('id')))
    .then(sortBy(prop('name'))) as Promise<{id: string, name: string}[]>
}
