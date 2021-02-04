import { TableUserConfig } from "table";
import { fileTransportConfig, LevelTransportConfig } from "./transports/interface";


export interface ConsoleLoggerInterface {
  log(message: string): void;
  error(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

export interface loggdemConfig {
  level?: string
  color?: String,
  useTable?: Boolean,
  dateFormat?: String
  tableProperties?: TableUserConfig
  transports?: LevelTransportConfig
}