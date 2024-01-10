/* eslint-disable camelcase */
// import * as R from 'ramda'
import { EventLog } from "../mongodb";
import { ObjectId } from "mongodb";
import moment from "moment";

const dbid2id = (obj: any) => {
  const { _id, ...other } = obj;
  return { id: _id, ...other };
};

const id2dbid = (obj: any) => {
  const { id, ...other } = obj;
  return { _id: id, ...other };
};

const addEventLog = async (newObj: any) => {
  EventLog.updateOne(
    { $or: [{ _id: new ObjectId() }] },
    {
      $set: {
        changeDate: moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYY-MM-DD HH:mm:ss"),
        ...newObj,
      },
    },
    { upsert: true }
  ).then((res) => res.upsertedId._id);
};

const getMaxGroup = (groups: string[]) => {
  const minSlashCount = Math.min(
    ...groups.map((item) => item.split("/").length - 1)
  );

  const result = groups.filter(
    (item) => item.split("/").length - 1 === minSlashCount
  );
  return result;
};

export { dbid2id, id2dbid, addEventLog, getMaxGroup };
