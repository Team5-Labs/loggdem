
import { Service } from "typedi";
import { ConsoleLoggerInterface } from "./interface";



@Service()
//@ts-expect-error
export class ConsoleLogger implements ConsoleLoggerInterface {
  constructor(msg: any, LevelConfig: object | object[], TransportConfig: object | object[]) {
    this.consoleHandler(msg, LevelConfig, TransportConfig)
  }
  getConfig(arg0: string): any {
    throw new Error("Method not implemented.");
  }
  // verbose(message:string){
  //   console
  // }
}