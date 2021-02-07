////@ts-nocheck
import moment from "moment";
import { emojify } from "node-emoji";
import { table } from "table";
import { isObject, isString } from "lodash"
import { loggdemConfig } from "./interface";
import { getLocation } from "./location";
import colorize from 'json-colorizer';
import * as jsonfile from 'jsonfile'
import * as path from 'path'
import fs from 'fs-extra'
import { boldify, checkColor, colorfy, filterArray, jsonify } from "./utils";
import { AsyncParser, parseAsync } from "json2csv";
import { Table } from "console-table-printer";

export class loggdem {
  constructor() {
    this.createLevel('info',
      {
        color: 'royalblue', useTable: true, dateFormat: '',
        transports: {
          //http: true,
          //@ts-ignore
          file: true,
          console: true
        },
      },
      (e, g) => this.configHandler(e, 'info', g))
    this.createLevel('error',
      {
        color: 'red',
        useTable: true,
        transports: {
          //file: true,
          //  http: true,
          console: true
        },
      },
      (e, g) => this.configHandler(e, 'error', g)
    )
    this.createLevel('debug',
      {
        color: 'orange',
        useTable: true,
        transports: {
          //file: true,
          //  http: true,
          console: true
        },
      },
      (e, g) => this.configHandler(e, 'debug', g)
    )
    this.createLevel('fatal',
      {
        color: 'red',
        useTable: true,
        transports: {
          //@ts-ignore
          file: true,
          //  http: true,
          console: true
        },
      },
      (e, g) => {
        this.configHandler(e, 'fatal', g)
      }
    )
    this.createTransport('console',
      {
        level: [{
          type: 'info',
          after: (name, type, res) => console.log('after', `${name} has finished with\n${type}`),
          cb: (e, f, g, h) => this.consoleHandler(e, f, g, h)
        }, 'debugs', 'fatal'],
        defaultLevel: 'info',
        after: {
          debug: (name, type, res) => console.log('after2', `${name} has finished with\n${type}`),
        },
      },
      (e, f, g, h) => this.consoleHandler(e, f, g, h)
    )
    this.createTransport('file',
      {
        level: ['info', 'debugs'],
        defaultLevel: 'info',
        dirPath: '',
        after: {
          //@ts-ignore
          // info: (name, type, res) => console.info(`${name} has finished with\n${res}`)
        }
      },
      (e, f, g, h) => this.fileHandler(e, f, g, h)
    )
  }
  private config: loggdemConfig[] = []
  private transports = []
  private tmpArr = [
    ['level', 'Message', 'Source', 'Date']
  ]
  createLevel(name: string, config?: loggdemConfig, cb: (msg: any, filter: object) => void = (msg, filter) => this.configHandler(msg, arguments[0], filter)) {
    let cfg: loggdemConfig
    //@ts-ignore
    if (config && typeof config !== 'object') {
      throw new Error('Config should be an object')
    }
    cfg = { color: 'blue', useTable: true, dateFormat: 'MMMM Do YYYY, h:mm:ss a', transports: { console: true } }
    if (isObject(config)) {
      Object.assign(cfg, config)
    }

    if (cb && typeof cb !== 'function') {
      throw new Error('Callback must be a function')
    }

    Object.defineProperty(cfg, 'level', { value: name, configurable: true, enumerable: true, writable: true })

    if (!Object.prototype.hasOwnProperty.call(loggdem.prototype, `${name}`)) {
      Object.defineProperty(loggdem.prototype, name, { value: cb, enumerable: true, writable: true, configurable: true })
    } else {
      throw new Error('Method exists, use setLevel to override default values')
    }
    this.config.push(cfg)
  }
  setLevel(name: string, config?: loggdemConfig, cb: (msg: any, filter: object) => void = (msg, filter) => this.configHandler(msg, arguments[0], filter)) {
    let cfg: loggdemConfig
    //@ts-ignore
    if (config && typeof config !== 'object') {
      throw new Error('Config should be an object')
    }
    cfg = { color: 'blue', useTable: true, dateFormat: 'MMMM Do YYYY, h:mm:ss a' }
    if (isObject(config)) {
      Object.assign(cfg, config)
    }

    if (cb && typeof cb !== 'function') {
      throw new Error('Callback must be a function')
    }

    Object.defineProperty(cfg, 'level', { value: name, configurable: true, enumerable: true, writable: true })
    if (!Object.prototype.hasOwnProperty.call(loggdem.prototype, `${name}`)) {
      throw new Error('Method does not exist, use createLevel to register a new Level method')
    } else {
      Object.defineProperty(loggdem.prototype, name, { value: cb, enumerable: true, writable: true, configurable: true })
    }
    this.config.push(cfg)
  }
  createTransport(name: string, config?: object | Array<object>, cb: (msg: any, LevelConfigs: any, TransportConfig: any, TransportName: string) => any = (msg, LevelConfigs, TransportConfig, TransportName) => { }) {
    let cfg: { level: string[]; defaultLevel: string; TransportName?: string }, transP: object
    let cfgArray = []
    cfg = { level: ['info', 'error', 'fatal', 'debug'], defaultLevel: 'info' }
    transP = {}
    if (Array.isArray(config)) {
      cfgArray = Array.from(config)
    } else if (isObject(config)) {
      Object.assign(cfg, config)
      cfg.TransportName = name
      cfgArray.push(cfg)
    } else {
      throw new Error('Config must be an Array or Object')
    }

    if (!cb || typeof cb !== 'function') {
      throw new Error('Callback must be a function')
    }


    Object.defineProperties(transP, {
      name: { value: name, configurable: true, enumerable: true, writable: true },
      cb: { value: cb, configurable: true, enumerable: true, writable: true },
      config: { value: cfgArray, configurable: true, enumerable: true, writable: true },
    })

    this.transports.push(transP)
    //@ts-ignore
    if (!Object.prototype.hasOwnProperty.call(loggdem.prototype, `$${name}`)) {
      Object.defineProperty(loggdem.prototype, `$${name}`, { value: (e: any, f: any) => this.tranportHandler(name, e, f), enumerable: true, writable: true, configurable: true })
    } else {
      throw new Error('Method exists, use setTransport to override default values')
    }


  }
  setTransport(name: string, config?: object | Array<object>, cb: (e: any, f: any, g: any, h: any) => any = (e, f, g, h) => this.consoleHandler(e, f, g, h)) {
    let cfg: { level: string[]; defaultLevel: string; TransportName?: string }, transP: object
    let cfgArray = []
    cfg = { level: ['info', 'error', 'fatal', 'debug'], defaultLevel: 'info' }
    transP = {}
    if (Array.isArray(config)) {
      cfgArray = Array.from(config)
    } else if (isObject(config)) {
      Object.assign(cfg, config)
      cfg.TransportName = name
      cfgArray.push(cfg)
    } else {
      throw new Error('Config must be an Array or Object')
    }
    if (!cb || typeof cb !== 'function') {
      throw new Error('Callback must be a function')
    }


    Object.defineProperties(transP, {
      name: { value: name, configurable: true, enumerable: true, writable: true },
      cb: { value: cb, configurable: true, enumerable: true, writable: true },
      config: { value: cfgArray, configurable: true, enumerable: true, writable: true },
    })

    let i = this.transports.findIndex(x => x.name == name)
    if (i >= 0) {
      this.transports.splice(i, 1, transP)
    } else {
      this.transports.push(transP)
    }
    //@ts-ignore
    if (!Object.prototype.hasOwnProperty.call(loggdem.prototype, `$${name}`)) {
      throw new Error('Method not found, create a new transport with "createTransport"')
    } else {
      Object.defineProperty(loggdem.prototype, `$${name}`, { value: (e: any, f: any) => this.tranportHandler(name, e, f), enumerable: true, writable: true, configurable: true })
    }


  }
  private async tranportHandler(name: string, msg: any, filter: any) {
    let tC = this.getTransport(name)
    let filtered = filter ? filterArray(tC.config, filter) : tC.config
    let levelAndfunc = filtered.map(x => x.level).flat()
    //@ts-ignore
    let typeMap = levelAndfunc.map(x => isObject(x) ? x.type : isString(x) ? x : '')
    typeMap = Array.from(new Set(typeMap))
    //@ts-ignore
    if (levelAndfunc.length > 0) {
      for (let i = 0; i < levelAndfunc.length; i++) {
        const elem = levelAndfunc[i];
        //@ts-ignore
        if (elem && isObject(elem) && elem.type && elem.cb && this.getConfig(elem.type)) {
          //@ts-ignore
          let res1 = elem['cb'].apply(this, [msg, this.getConfig(elem.type), filtered, tC.name])
          //@ts-ignore
          if (res1 && elem.after && typeof elem.after == 'function') {
            //@ts-ignore
            elem.after.call(this, tC.name, elem.type, res1)
          }
        } else if (elem && isString(elem) && this.getConfig(elem)) {
          let res2 = tC['cb'].apply(this, [msg, this.getConfig(elem), filtered, tC.name])
          if (res2 && filtered.map(x => x.after).length > 0 && isObject(filtered[0].after)) {
            let objres = filtered[0].after
            for (const [key, value] of Object.entries(objres)) {
              if (key && value !== false && key == elem && typeof value == 'function') {
                value.call(this, tC.name, elem, res2)
              }
            }
          }
        }
      }
    }



  }
  public getConfig(level?: string) {
    return level && isString(level) ? this.config.find(x => x.level == level) : this.config
  }
  public getTransport(name: string) {
    return name && isString(name) ?
      this.transports.find(x => x.name == name) : this.transports
  }
  private async configHandler(e: any, level: string, filter = {}) {
    let t = this.getConfig(level)
    //@ts-ignore
    let transP = t.transports ? t.transports : {}
    let f: string | string[]
    //@ts-ignore
    if (filter && filter.exclude && Array.isArray(filter.exclude)) {
      //@ts-ignore
      f = filter.exclude
    } else {
      f = []
    }
    for (const [key, value] of Object.entries(transP)) {
      if (key && value !== false) {
        for (let i = 0; i < this.transports.length; i++) {
          const o = this.transports[i];
          if (o && o.name == key && value !== false && !f.includes(key)) {
            let b = o.config.map(x => x.level).flat()
            //@ts-ignore
            if (b.length > 0 && b.map(x => isObject(x) ? x.type : isString(x) ? x : '').includes(level)) {
              for (let i = 0; i < b.length; i++) {
                const elem = b[i];
                //@ts-ignore
                if (elem && isObject(elem) && elem.type == level && elem.cb && this.getConfig(elem.type)) {
                  //@ts-ignore
                  let res1 = elem['cb'].apply(this, [e, this.getConfig(elem.type), o.config, o.name])
                  //@ts-ignore
                  if (res1 && elem.after && typeof elem.after == 'function') {
                    //@ts-ignore
                    elem.after.call(this, key, elem.type, res1)
                  }
                } else if (elem == level && isString(elem) && this.getConfig(elem)) {
                  let res2 = o['cb'].apply(this, [e, this.getConfig(elem), o.config, o.name])
                  if (res2 && o.config.map(x => x.after).length > 0 && isObject(o.config[0].after)) {
                    let objres = o.config[0].after
                    for (const [Okey, value] of Object.entries(objres)) {
                      if (Okey && value !== false && Okey == level && typeof value == 'function') {
                        value.call(this, key, elem, res2)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  private consoleHandler(e: any, f: any, config: any, transportName: string) {

    function manageConfig(objj: { useTable: any; level: any; color: any; tableProperties: any; dateFormat: any; }) {
      const { useTable, level, color, tableProperties, dateFormat } = objj
      let onMissing = function (name: any) {
        return name;
      }
      e = emojify(e, onMissing)
      var output: string
      if (useTable && useTable == true) {
        let data = [
          [boldify('level'), boldify('Message'), boldify('Source'), boldify('Date')],
          [colorfy(level.toUpperCase(), color), e, getLocation(), moment().format(dateFormat)],
        ]
        let tableConfig = {
          columns: {
            0: {
              alignment: 'center',
            },
            1: {
              alignment: 'center',
            },
            2: {
              alignment: 'center',
            },
            3: {
              alignment: 'center'
            },
          },
          ...tableProperties
        };

        output = table(data, tableConfig);
      } else {
        let outp = {
          LEVEL: level.toUpperCase(),
          Message: e,
          Location: getLocation(),
          Date: moment().format(dateFormat)
        }
        let j = jsonify(outp)
        let r = colorize(j, {
          colors: {
            // STRING_KEY: color,
            STRING_LITERAL: color,
            NUMBER_LITERAL: color
          }, pretty: true
        })
        output = r
      }
      return output

    }
    let u = manageConfig(f)
    console.log(u)
    return u
  }
  private fileHandler(e: any, f: any, config: any, transportName) {
    function manageConfig(objj: { useTable: any; level: any; color: any; tableProperties: any; dateFormat: any; }) {
      const { level, dateFormat } = objj
      let onMissing = function (name: any) {
        return name;
      }
      e = emojify(e, onMissing)
      let outp = {
        LEVEL: level.toUpperCase(),
        Message: e,
        Location: getLocation(),
        Date: moment().format(dateFormat)
      }
      return outp
    }
    let arr = []
    let res = manageConfig(f)
    const defaultFilePath = './fileLog'
    let baseD, fileName, linePrefix
    let today: Date = new Date()
    let _dateString = `${today.getFullYear()}-${(today.getMonth() + 1)}-${today.getDate()}`;
    let _timeString = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    fileName = `${_dateString}.log`;
    linePrefix = `[${_dateString} ${_timeString}]`;
    const p = path.join(__dirname, defaultFilePath)
    let fileConfig = Array.isArray(config) ? config : []
    if (fileConfig.length > 0) {
      baseD = fileConfig[0].dirPath ? fileConfig[0].dirPath : p
      let tableConfig = {
        columns: {
          0: {
            alignment: 'center',
          },
          1: {
            alignment: 'center',
          },
          2: {
            alignment: 'center',
          },
          3: {
            alignment: 'center'
          },
        },
      };
      for (const [key, value] of Object.entries(res)) {
        if (key && value) {
          arr.push(value)
        }
      }
      this.tmpArr.push(arr)
      let o = table(this.tmpArr, tableConfig)
      //console.log(o)
      let writer = fs.createWriteStream(`${baseD}/${fileName}`, { flags: 'w' })
      writer.write(o)
      return res
    }
  }
}