import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-bearer";
import {
  filter,
  map,
  pipe,
  prop,
  toPairs,
  length,
  includes,
  assoc,
  unnest,
  pluck,
  xprod,
  slice,
  tail,
  join,
  applySpec,
  __,
  identity,
  lt,
  uniq,
  uniqBy,
  concat,
  pick,
  groupBy,
  append,
  last,
  reduce,
  mergeDeepWithKey,
} from "ramda";
import axios, { AxiosInstance } from "axios";
import socketio from "socket.io";
import config from "../config/auth";
import cache from "../cache";

export type Auth = {
  token: string;
  claims: any;
};

export type KeycloakGroup = {
  id: string;
  name: String;
  path: string;
  subGroups?: KeycloakGroup[];
};

export type UserInfo = {
  id: string;
  name: string;
  roles: string[];
  token: string;
  claims: any;
  hasPower: (roles: string[] | undefined) => boolean;
  groups: string[];
  enabled: boolean;
};

export type AuthContext = {
  auth?: Auth;
  user?: UserInfo;
};

export type AuthRequest = Request & Partial<AuthContext>;

export const protect =
  (...args: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user !== undefined) {
      if (req.user.hasPower(args)) {
        next();
      } else {
        res.status(403).send("未授权");
      }
    } else {
      res.status(401).send("访问拒绝");
    }
  };

const nextFunction =
  (req: AuthRequest, next: (err?: any) => void) => (err?: any) => {
    if (req.auth !== undefined) {
      const id = prop<"preferred_username", string>("preferred_username");
      const givenName = prop<"given_name", string>("given_name");
      const familyName = prop<"family_name", string>("family_name");
      const name = (o: any) =>
        (familyName(o) || "") + (givenName(o) || "") || id(o);
      const allRoles = (obj: any) =>
        pipe<any, any, any>(prop("realm_access"), assoc("realm"))(obj)(
          prop("resource_access")(obj)
        );
      const groups = prop<"group_path", string[]>("group_path");

      const flatRoles = pipe<any, any, any, any, any, any, any, string[]>(
        allRoles,
        pluck("roles"),
        toPairs,
        map<any, any>(unnest),
        map<any, any>((s) => xprod(slice<any>(0, 1, s), tail<any>(s))),
        unnest,
        map(join(":"))
      );
      const getUser = applySpec({
        id,
        name,
        roles: flatRoles,
        groups,
        enabled: prop<"enabled", boolean>("enabled")
      });

      const user = getUser(req.auth.claims);

      const hasPower = (roles: string[] = []) =>
        roles.length === 0
          ? true
          : pipe(
              map(includes(__, user.roles)),
              filter(identity),
              length,
              lt(0)
            )(roles);

      req.user = { ...user, ...req.auth, hasPower };
    }
    next(err);
  };

const keycloakMiddleware = auth(config);
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const myNext: NextFunction = nextFunction(req, next);

  keycloakMiddleware(req, res, myNext);
}

export function wsAuthMiddleware(
  socket: socketio.Socket,
  next: (err?: Error) => void
) {
  const req = socket.request as AuthRequest;
  const myNext: NextFunction = nextFunction(req, next);

  keycloakMiddleware(req, null, myNext);
}

export function getGroupUsers(user: UserInfo) {
  const { origin, pathname } = new URL(config.issuerBaseURL);
  const keycloakAdminUrl = origin + pathname.replace("auth", "auth/admin");
  const keycloakReqConfig = {
    headers: { Authorization: `Bearer ${user.token}` },
    baseURL: keycloakAdminUrl,
  };
  const groups = user.groups || [];

  const inst = axios.create(keycloakReqConfig);

  // eslint-disable-next-line no-useless-escape
  const roots = uniq(groups.map((g) => g.match(/^\/[^\/]+/)![0]));
  return getUserByRootGroups(roots, inst);
}

export type UserWithGroup = {
  id: string;
  name: string;
  groups: string[];
  email: string;
  enabled: boolean;
};

async function getUserByRootGroups(roots: string[], fetch: AxiosInstance) {
  const users = await Promise.all(
    roots.map((root) => getUserByRootGroup(root, fetch))
  );
  const concatGroups = (k: any, l: any, r: any) =>
    k === "groups" ? concat(r, l) : r;
  return pipe<any, any, any, any, any, any>(
    unnest,
    groupBy<any>(prop("id")),
    toPairs,
    map(last),
    map(reduce(mergeDeepWithKey(concatGroups), { groups: [] }))
  )(users) as any[] as UserWithGroup[];
}

async function getUserByRootGroup(root: string, fetch: AxiosInstance) {
  let us = cache.get<UserWithGroup[]>(root);

  if (us === undefined) {
    const groupList = await getGroupList(root, fetch);
    const usersPromise = groupList.map((g) =>
      getUserByGroup(g.id, fetch).then((users) =>
        users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          groups: g.path,
          enabled: u.enabled,
        }))
      )
    );
    const users = unnest(await Promise.all(usersPromise));
    const concatGroups = (k: any, l: any, r: any) =>
      k === "groups" ? append(r, l) : r;
    const proc = pipe(
      groupBy<any>(prop("id")),
      toPairs,
      map<any, any>(last),
      map(reduce(mergeDeepWithKey(concatGroups), { groups: [] }))
    );
    us = proc(users) as any[] as UserWithGroup[];
    cache.set(root, us);
  }

  return us || [];
}

async function getGroupList(root: string, fetch: AxiosInstance) {
  function rGroupList(
    gs: KeycloakGroup[]
  ): Pick<KeycloakGroup, "id" | "path">[] {
    if (gs.length === 0) {
      return [];
    }
    return concat(
      gs.map(pick(["id", "path"])),
      rGroupList(unnest(gs.map((g) => g.subGroups!)))
    );
  }

  const groups = await fetch.get("/groups").then((res) => res.data);
  return uniqBy(prop("id"), rGroupList(groups)).filter((g) =>
    g.path.startsWith(root)
  );
}

async function getUserByGroup(groupId: string, fetch: AxiosInstance) {
  const getName = (d: any) =>
    (d.lastName || "") + (d.firstName || "") || d.username;
  /**
   * Keycloak Admin API /groups/{groupId}/members 默认只返回该分组下“活跃”（enabled = true）的用户。
   * 如果一个账户被禁用（enabled=false），它通常就不会出现在这个接口的结果里，
   * 除非你对那个分组拥有更高权限（比如是该分组的管理员）或者专门使用 /admin/realms/{realm}/users 带 enabled=false 参数去查询。
   * 你自己所在的分组，因为你对它有管理/查看权限，Keycloak 允许你看到 disabled 用户。
   * 其它分组，你并没有那种管理权限，Admin API 就只给你看 enabled = true 的成员。
   */
  const users = await fetch
    .get(`/groups/${groupId}/members`)
    .then((res) => res.data as any[]);
  return users.map((u) => ({
    id: u.username,
    name: getName(u),
    email: u.email,
    enabled: u.enabled
  }));
}

export function getUsersByGroups(user: UserInfo, group: string[]) {
  const { origin, pathname } = new URL(config.issuerBaseURL);
  const keycloakAdminUrl = origin + pathname.replace("auth", "auth/admin");
  const keycloakReqConfig = {
    headers: { Authorization: `Bearer ${user.token}` },
    baseURL: keycloakAdminUrl,
  };
  const inst = axios.create(keycloakReqConfig);

  return getUserByRootGroups(group, inst);
}

export function getAllGroups(user: UserInfo) {
  const { origin, pathname } = new URL(config.issuerBaseURL);
  const keycloakAdminUrl = origin + pathname.replace("auth", "auth/admin");
  const keycloakReqConfig = {
    headers: { Authorization: `Bearer ${user.token}` },
    baseURL: keycloakAdminUrl,
  };
  const inst = axios.create(keycloakReqConfig);
  return getGroupList("/", inst);
}

export function getUsersByRole(user: UserInfo, role: string) {
  const { origin, pathname } = new URL(config.issuerBaseURL);
  const keycloakAdminUrl = origin + pathname.replace("auth", "auth/admin");
  const keycloakReqConfig = {
    headers: { Authorization: `Bearer ${user.token}` },
    baseURL: keycloakAdminUrl,
  };
  const inst = axios.create(keycloakReqConfig);
  return getUserByRole(role, inst);
}

async function getUserByRole(role: string, fetch: AxiosInstance) {
  const getName = (d: any) =>
    (d.lastName || "") + (d.firstName || "") || d.username;
  // const users = await fetch.get(`/roles`).then(res => res.data as any[])
  const users = await fetch
    .get(`/roles/${role}/users?first=0&max=5`)
    .then((res) => res.data as any[]);
  // console.log(users)
  // console.log(users2)
  return users.map((u) => ({
    id: u.username,
    name: getName(u),
    email: u.email,
    enabled: u.enabled
  }));
}
