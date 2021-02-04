import { TableUserConfig } from "table";

/**
 * Default transport interface 
 */
export interface defaultTransportConfig {
  /**
   * Logger Levels the tranport would Listen on  
   */
  level?: string[],

  /**
   * Default Level to listen to 
   */
  defaultLevel?: string,

  [param: string]: any
}

export interface LevelTransportConfig {
  [param: string]: any
  file?: fileTransportConfig
  http?: httpTransportConfig
  console?: consoleTranposrtConfig
}

/**
 * Auth params to be used for http transport
 */
export interface httpTransportAuthConfig {
  /**
   * Username to be used for the http request
   */
  username: string,
  /**
   * Password to be used for the http request
   */
  password: string
}

/**
 * Config for HTTP transport
 */
export interface httpTransportConfig {
  /**
   * Auth params - Optional
   */
  auth?: httpTransportAuthConfig,
  /**
   * The NODE_ENV to use - used in filtering
   */
  env?: string,
  /**
   * Encrypt the payload(Logs)
   */
  encrypt?: boolean,
  /**
   * Destination URI to be used for the request - POST
   */
  url: String
}

/**
 * Config for file transport
 */
export interface fileTransportConfig {
  /**
   * Print tables in Log file
   */
  tables: boolean
  /**
   * Table config 
   * @tutorial https://github.com/gajus/table#readme
   */
  tablesConfig?: TableUserConfig
  /**
   * Path to the file used for Log storage 
   */
  path: string | object[]
}

export type consoleTranposrtConfig = boolean