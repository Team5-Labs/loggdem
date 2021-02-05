//@ts-nocheck
// import 'reflect-metadata';
// import express from 'express';
// import { addJobToFileLog } from './logger/transports/file/job';
// import { ConsoleLoggerInterface } from './logger/interface';
// import { consoleLogger, Logger, } from './logger';
// import { Inject, Service, Container } from 'typedi';
// import { ConsoleLogger } from './logger/console';
import { loggdem } from './logger';

// import * as http from 'http';
// import * as bodyparser from 'body-parser';
// import * as winston from 'winston';
// import * as expressWinston from 'express-winston';
// import cors from 'cors'
// import {CommonRoutesConfig} from './common/common.routes.config';
// import {UsersRoutes} from './users/users.routes.config';
// import debug from 'debug';
// const server: http.Server = http.createServer(app);
// const port: Number = 3000;
// const routes: Array<CommonRoutesConfig> = [];
// const debugLog: debug.IDebugger = debug('app');

// app.use(bodyparser.json());
// app.use(cors());

// app.use(expressWinston.logger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     )
// }));

// routes.push(new UsersRoutes(app));

// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     )
// }));

// const app: express.Application = express();
// import { JobsOptions, Queue, Worker } from 'bullmq';

// const httpLogQueue = new Queue('httpLog')

// const databaseLogQueue = new Queue('databaseLog')
// const consoleLogQueue = new Queue('consoleLog')

// async function addJobToHttpLog({ name, data, options }: { name: string; data: any; options?: JobsOptions | undefined; }) {
//   if (!name || typeof name !== String as unknown as string) {
//     return `Name parameter missing or not a String`
//   }
//   if (!data) {
//     return `Data cannot be empty`
//   }
//   await httpLogQueue.add(name, data, options)
// }



// async function addJobToDatabseLog({ name, data, options }: { name: string; data: any; options?: JobsOptions | undefined; }) {
//   if (!name || typeof name !== String as unknown as string) {
//     return `Name parameter missing or not a String`
//   }
//   if (!data) {
//     return `Data cannot be empty`
//   }
//   await databaseLogQueue.add(name, data, options)
// }

// async function addJobToConsoleLog({ name, data, options }: { name: string; data: any; options?: JobsOptions | undefined; }) {
//   if (!name || typeof name !== String as unknown as string) {
//     return `Name parameter missing or not a String`
//   }
//   if (!data) {
//     return `Data cannot be empty`
//   }
//   await consoleLogQueue.add(name, data, options)
// }

// app.get('/', (req: express.Request, res: express.Response) => {
//     res.status(200).send(`Server running at http://localhost:${port}`)
// });
// server.listen(port, () => {
//     debugLog(`Server running at http://localhost:${port}`);
//     routes.forEach((route: CommonRoutesConfig) => {
//         debugLog(`Routes configured for ${route.getName()}`);
//     });
// });

// var myName = (e: any) => {
//   return `function is ${e}`
// };
// let key = 'log'
// var f = function () {
//   return ''
// };
// 
// var bValue = 38;
// Object.defineProperty(f, 'b', { value: myName });
// 
// console.log(f.b('josh'))

// const d = {
//   name: 'test',
//   data: {
//     foo: 'basr'
//   },

// }

// const ff = async () => {
//   await addJobToFileLog(d)
// }

// ff()


// let t = new logdem(
//   [{
//     level: 'info',
//     config: {
//       colour: 'blue',
//       formatDate: true,
//       location: true,
//       emoji: true
//     },
//     http: {
//       level: ['info'] || 'info',
//       encrypt: false,
//       table: false || [true, 'tableConfig'],
//       auth: {
//         username: '',
//         password: ''
//       },
//       group: 'complex',
//       env: 'test'
//     },
//     file: false,
//     database: false,
//     console: true
//   }])


// t.addLevel('info', {
//   colour: 'blue',
//   formatDate: true,
//   location: true,
//   emoji: true,
//   http: {
//     level: ['info'] || 'info',
//     encrypt: false,
//     table: false || [true, 'tableConfig'],
//     auth: {
//       username: '',
//       password: ''
//     },
//     group: 'complex',
//     env: 'test'
//   },
//   file: false,
//   database: false,
//   console: true
// })

// 
// console.log(t)


// // UserRepository.ts
// @Service()
// export class UserRepository {
//   constructor(@consoleLogger() private logger: ConsoleLoggerInterface) { }

//   save(user: any) {
//     this.logger.error(`user ${user} has been saved.`);
//   }
// }
let logger = new loggdem()

// logger.createTransport('http', [{
//   levels: ['info', 'error'],
//   urls: [
//     {
//       url: 'http://test.com',
//       env: 'test',
//       level: 'info',
//     },
//     {
//       url: 'http://test2.com'
//     }
//   ]
// }])

//logger.setTransport('console', { level: ['',], },)



// logger.$console('If you were to use the source, you’ll notice it won’t ',
//   {
//     level: ['info'],
//     test: false
//   })

// 

logger.info('Josh')

// logger.debug('This is a debug', { exclude: ['consoles'] })

// logger.fatal('This is fatal')

// logger.$console('this is from the console')

// // console.log('lo', logger)
// logger.createLevel('debugs', { color: 'yellow', useTable: false },)

// // 
// // logger.debug('hello', { exclude: ['console'] })
// 
// logger.debugs('hello',)