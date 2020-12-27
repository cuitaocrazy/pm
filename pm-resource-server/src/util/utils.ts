/* eslint-disable camelcase */
// import * as R from 'ramda'

const dbid2id = (obj: any) => {
  const { _id, ...other } = obj
  return { id: _id, ...other }
}

const id2dbid = (obj: any) => {
  const { id, ...other } = obj
  return { _id: id, ...other }
}
export {
  dbid2id,
  id2dbid,
}
