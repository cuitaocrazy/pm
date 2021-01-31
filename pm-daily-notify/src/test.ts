import moment from 'moment'
import { getWorkDays } from './util/utils'

const month = moment().year(2020).year()
console.log(month)

console.log(moment().year())
console.log(getWorkDays(moment().year(), ['20210101', '20210102']))
