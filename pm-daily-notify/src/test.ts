import moment from "moment";
import { getWorkDays } from "./util/utils";
import { Users } from "./keycloak";

const month = moment().year(2020).year();
console.log(month);
console.log(moment("20240107", "YYYYMMDD").valueOf());
// Users()
//   .then((test) => {
//     console.log("test");
//   })
//   .then((user) => {
//     console.log(user);
//   });
