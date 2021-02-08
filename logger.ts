//@ts-nocheck
import moment from "moment";
import { emojify } from "node-emoji";
import { table } from "table";
import { loggdemConfig } from "./interface";
import { getLocation } from "./location";
import colorize from 'json-colorizer';
import * as path from 'path'
import fs from 'fs-extra'
import { boldify, checkColor, colorfy, filterArray, isArray, isObject, isString, jsonify } from "./utils";
export class loggdem {
  constructor() {
    this.createLevel('info',
      {
        color: 'royalblue', useTable: false, dateFormat: '',
        transports: {
          //http: true,
          //@ts-ignore
          file: true,
          console: true,
          f: true
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
          file: true,
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
        }, 'debug', 'fatal'],
        defaultLevel: 'info',
        group: ['five'],
        env: 'prods',
        after: {
          debug: (name, type, res) => console.log('after2', `${name} has finished with\n${type}`),
        },
      },
      // (e, f, g, h) => this.consoleHandler(e, f, g, h)
    )
    this.createTransport('file',
      {
        level: ['info', 'debug'],
        defaultLevel: 'info',
        dirPath: '',
        env: 'prod',
        group: ['five'],
        after: {
          //@ts-ignore
          info: (name, type, res) => console.info(`${name} has finished with\n${res}`)
        }
      },
      (e, f, g, h) => this.fileHandler(e, f, g, h)
    )
  }
  private config: loggdemConfig[] = []
  private transports = []
  private tmpArrDisplay = [
    ['level', 'Message', 'Source', 'Date']
  ]
  private tmpArrJson = []
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
  createTransport(name: string, config?: object | Array<object>, cb: (msg: any, LevelConfigs: any, TransportConfig: any, transportName: string) => any = (msg, LevelConfigs, TransportConfig, transportName) => { }) {
    let cfg: { level: string[]; defaultLevel: string; transportName?: string }, transP: object
    let cfgArray = []
    cfg = { level: ['info', 'error', 'fatal', 'debug'], defaultLevel: 'info' }
    transP = {}
    if (isObject(config)) {
      Object.assign(cfg, config)
      cfg.transportName = name
      cfgArray.push(cfg)
    } else {
      throw new Error('Config must be an Object')
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
    let cfg: { level: string[]; defaultLevel: string; transportName?: string }, transP: object
    let cfgArray = []
    cfg = { level: ['info', 'error', 'fatal', 'debug'], defaultLevel: 'info' }
    transP = {}
    if (isObject(config)) {
      Object.assign(cfg, config)
      cfg.transportName = name
      cfgArray.push(cfg)
    } else {
      throw new Error('Config must be an Object')
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
          let result = this.manageConfig(msg, this.getConfig(elem.type), filtered, tC.name)
          //let res1 = elem['cb'].apply(this, [msg, this.getConfig(elem.type), filtered, tC.name])
          let res1 = elem['cb'].apply(this, [result])
          if (res1 && elem.after && typeof elem.after == 'function') {
            elem.after.call(this, tC.name, elem.type, res1)
          }
        } else if (elem && isString(elem) && this.getConfig(elem)) {
          let result = this.manageConfig(msg, this.getConfig(elem), filtered, tC.name)
          let res2 = tC['cb'].apply(this, [result])
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
    if (!e) {
      return 'Message is missing'
    }
    if (typeof e !== 'string') {
      //throw new Error('Message must be a string')
      e = String(e)
    }
    let transP = t.transports ? t.transports : {}
    let f: any[] = []
    if (filter && isObject(filter)) {
      f = filter
    } else {
      f = {}
    }
    let transportNames = this.transports.map(x => x.name)
    function isLevelPresent(array, l) {
      return array.map(x => x.level).flat().map(x => isObject(x) ? x.type : isString(x) ? x : '').includes(l)
    }
    for (const [key, value] of Object.entries(transP)) {
      // console.time(`${key}`)
      if (transportNames.includes(key) && value !== false && e) {
        //console.log('t', transportNames.includes(key), transportNames, key)
        const { config, name, cb } = this.getTransport(key)

        let newConfig = filterArray(config, f)
        let nTc = config.map(x => x.level).flat()
        if (newConfig.length > 0 && isLevelPresent(newConfig, level)) {
          let index = nTc.findIndex(x => isObject(x) && x.type ? x.type == level : isString(x) ? x == level : '' == level)
          if (index !== -1) {
            let tC = nTc[index]
            if (isObject(tC) && tC['cb'] && typeof tC['cb'] == 'function') {
              let res = this.manageConfig(e, this.getConfig(level), config, name)
              let result = tC['cb'].apply(this, [res])
              if (result && tC.after && typeof tC.after == 'function') {
                tC['after'].call(this, key, level, result)
              }
            } else if (typeof cb == 'function') {
              let res = this.manageConfig(e, this.getConfig(level), config, name)
              let result = cb.apply(this, [res])
              if (result && config.map(x => x.after).length > 0 && isObject(config[0].after)) {
                let objres = config[0].after
                for (const [Okey, value] of Object.entries(objres)) {
                  if (Okey && value !== false && Okey == level && typeof value == 'function') {
                    value.call(this, key, level, result)
                  }
                }
              }
            }
          }
          // console.timeEnd(`${key}`)
        }

      }
    }

    // for (const [key, value] of Object.entries(transP)) {
    //   //const element = array[index];

    //   for (let i = 0; i < this.transports.length; i++) {
    //     const o = this.transports[i];
    //     console.time(`${o.name}`)
    //     let tC = o.config
    //     let b = o.config.map(x => x.level).flat()
    //     if (o && o.name == key && value !== false) {
    //       //@ts-ignore
    //       if (b.length > 0 && b.map(x => isObject(x) ? x.type : isString(x) ? x : '').includes(level)) {
    //         for (let i = 0; i < b.length; i++) {
    //           const elem = b[i];
    //           //@ts-ignore
    //           if (elem && isObject(elem) && elem.type == level && elem.cb && this.getConfig(elem.type)) {
    //             //@ts-ignore
    //             let res1 = elem['cb'].apply(this, [e, this.getConfig(elem.type), o.config, o.name])
    //             //@ts-ignore
    //             if (res1 && elem.after && typeof elem.after == 'function') {
    //               //@ts-ignore
    //               elem.after.call(this, key, elem.type, res1)
    //             }
    //           } else if (elem == level && isString(elem) && this.getConfig(elem)) {
    //             let res2 = o['cb'].apply(this, [e, this.getConfig(elem), o.config, o.name])
    //             if (res2 && o.config.map(x => x.after).length > 0 && isObject(o.config[0].after)) {
    //               let objres = o.config[0].after
    //               for (const [Okey, value] of Object.entries(objres)) {
    //                 if (Okey && value !== false && Okey == level && typeof value == 'function') {
    //                   value.call(this, key, elem, res2)
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }

    //     console.timeEnd(`${o.name}`)
    //   }
    // }

  }
  manageConfig(e: any, levelConfig: any, transportConfig: any, transportName: string) {
    const { level, dateFormat } = levelConfig
    let onMissing = function (name: any) {
      return name;
    }
    e = emojify(e, onMissing)

    let output = {
      LEVEL: level.toUpperCase(),
      Message: e,
      Location: getLocation(),
      Date: moment().format(dateFormat)
    }

    levelConfig['color'] = checkColor(levelConfig['color'] ? levelConfig['color'] : 'white')
    return { output, levelConfig, transportConfig, transportName }

  }
  private consoleHandler(obj) {
    const { output, levelConfig } = obj
    function consoleLogger(output, levelConfig) {
      const { color, useTable, tableProperties } = levelConfig
      let onMissing = function (name: any) {
        return name;
      }
      let result;
      output['Message'] = emojify(output['Message'], onMissing)
      let data = [
        [boldify('level'), boldify('Message'), boldify('Source'), boldify('Date')],
        // [colorfy(level.toUpperCase(), color), e, getLocation(), moment().format(dateFormat)],
      ]
      if (useTable && useTable == true) {
        let tmpA = []
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
        output['LEVEL'] = colorfy(output['LEVEL'], levelConfig['color'])
        for (const [key, value] of Object.entries(output)) {
          tmpA.push(value)
        }
        data.push(tmpA)
        result = table(data, tableConfig)
      } else {
        let j = jsonify(output)
        let r = colorize(j, {
          colors: {
            // STRING_KEY: color,
            STRING_LITERAL: color,
            NUMBER_LITERAL: color
          }, pretty: true
        })
        result = r
      }
      return result
    }
    let u = consoleLogger(output, levelConfig)
    console.log(u)
    return u
  }
  private fileHandler(obj) {
    const { output, transportConfig } = obj
    let arr = []
    let res = output
    const defaultFilePath = './fileLog'
    let baseD, fileName, linePrefix
    let today: Date = new Date()
    let _dateString = `${today.getFullYear()}-${(today.getMonth() + 1)}-${today.getDate()}`;
    let _timeString = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    fileName = `${_dateString}.log`;
    linePrefix = `[${_dateString} ${_timeString}]`;
    const p = path.join(__dirname, defaultFilePath)
    let fileConfig = isArray(transportConfig) ? transportConfig : []
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
      this.tmpArrDisplay.push(arr)
      let o = table(this.tmpArrDisplay, tableConfig)
      let writer = fs.createWriteStream(`${baseD}/${fileName}`, { flags: 'w' })
      writer.write(o)
      return res
    }
  }
}