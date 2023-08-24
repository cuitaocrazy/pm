import moment from 'moment'
import { isNil } from 'ramda'
import { AuthContext } from '../../auth/oauth'
import { ObjectId } from 'mongodb'
import { ProjectAgreement } from '../../mongodb'
import { dbid2id } from '../../util/utils'

export default {
  Query: {
    projectAgreements: (_: any, __: any, context: AuthContext) => ProjectAgreement
      .find()
      .map(dbid2id)
      .toArray(),
  },
  Mutation: {
  },
}
