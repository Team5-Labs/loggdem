////@ts-nocheck
import moment from "moment";
import { emojify } from "node-emoji";
import { table } from "table";
import { isObject, isString } from "lodash"
import { loggdemConfig } from "./interface";
import { getLocation } from "./location";
import colorize from 'json-colorizer';
import { boldify, checkColor, colorfy, filterArray, jsonify } from "./utils";

export class loggdem {
  constructor() {
    this.createLevel('info',
      {
        color: 'royalblue', useTable: true, dateFormat: '',
        transports: {
          // file: {
          //   json: true,
          //   html: true,
          //   txt: true,
          //   csv: true
          // },
          // http: true,
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
          //file: true,
          //  http: true,
          console: true
        },
      },
      (e, g) => {
        this.configHandler(e, 'fatal', g)
      }
    )
    this.createTransport('console',
      { level: [{ type: 'info', cb: (e, f, g) => console.log('ee', e, 'ff', f, 'gg', g) }], defaultLevel: 'info' },
      (e, f, g, h) => this.consoleHandler(e, f, g, h)
    )
    this.createTransport('file',
      {
        level: ['info',],
        defaultLevel: 'info',
        baseDir: 'logFiles',
        path: '',
        json: {
          folderName: 'jsonlog'
        },
        html: {
          folderName: 'htmlLog'
        },
        txt: {
          folderName: 'txtlog'
        },
        csv: {
          folderName: 'csvLog'
        }
      },
      (e, f, g, h) => this.consoleHandler(e, f, g, h)
    )
  }
  private config: loggdemConfig[] = []
  private transports = []
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
  private tranportHandler(name: string, msg: any, filter: any) {
    let tC = this.getTransport(name)
    let filtered = filter ? filterArray(tC.config, filter) : tC.config
    let levelAndfunc = filtered.map(x => x.level).flat()
    //@ts-ignore
    let typeMap = levelAndfunc.map(x => isObject(x) ? x.type : isString(x) ? x : '')
    typeMap = Array.from(new Set(typeMap))
    //@ts-ignore
    let allowedConfig = this.getConfig().filter(x => typeMap.includes(x.level))
    if (levelAndfunc.length > 0) {
      for (let i = 0; i < levelAndfunc.length; i++) {
        const elem = levelAndfunc[i];
        //@ts-ignore
        if (elem && isObject(elem) && elem.type && elem.cb && allowedConfig.length > 0) {
          elem['cb'].apply(this, [msg, allowedConfig[0], filtered, tC.name])
        } else if (elem && isString(elem) && this.getConfig(elem)) {
          tC['cb'].apply(this, [msg, this.getConfig(elem), filtered, tC.name])
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
  private configHandler(e: any, level: string, filter = {}) {
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
            if (b.length > 0) {
              for (let i = 0; i < b.length; i++) {
                const elem = b[i];
                // console.log('elem', elem)
                //@ts-ignore
                if (elem && isObject(elem) && elem.type && elem.cb && t) {
                  elem['cb'].apply(this, [e, t, o.config, o.name])
                } else if (elem && isString(elem) && this.getConfig(elem)) {
                  console.log('hello')
                  o['cb'].apply(this, [e, t, o.config, o.name])
                }
              }
            }


          }
        }
      }
    }
    return
  }
  private consoleHandler(e: any, f: any, config: any, transportName: string) {
    let dL: any
    let Lconfig = []
    let Co: string | any[]
    let typeMap, allowedConfig
    let combined: any = {}

    console.log('e', e)
    console.log('f', f)
    console.log('config', config)

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


  }
  private fileHandler(e: any, f: any, config: any, transportName, transportNameConfig) {
    let dL: any
    let Lconfig = []
    let Co: string | any[]

    if (Array.isArray(config) && config) {
      Co = config.map(x => x.level).flat()
      if (Co.length > 0 && Array.isArray(f)) {
        Lconfig = f.filter(x => Co.includes(x.level))
      } else if (Co.length > 0 && !Array.isArray(f)) {
        Lconfig.push(f)
      } else {
        //@ts-ignore
        const { defaultLevel } = config
        dL = 'info' || defaultLevel && isString(defaultLevel) ? defaultLevel : 'info'
        Lconfig.push(this.getConfig('info'))
      }
    }
    function manageConfig(objj: { useTable: any; level: any; color: any; tableProperties: any; dateFormat: any; }) {
      const { useTable, level, color, tableProperties, dateFormat } = objj
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

      return { outp }

    }
  }
}