//@ts-nocheck
import { isObject } from "lodash";
import { loggdem } from "./logger";
import { isArray } from "./utils";

let logger = new loggdem
console.time('100 test')
for (let index = 1; index <= 100; index++) {
  logger.info(`Test - ${index}`, {
    transportName: ['console',]
  })
}
console.timeEnd('100 test')

//@ts-ignore
//logger.info('test2',)
// logger.info('test', {
//   env: 'prod',
//   group: (g) => g && g.find(x => ['five'].includes(x))
// })
