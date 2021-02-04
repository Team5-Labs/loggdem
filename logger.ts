//@ts-nocheck
import chalk from "chalk";
import { isString } from "lodash";
import moment from "moment";
import { emojify } from "node-emoji";
import { table } from "table";
import { isObject, isString } from "lodash"
import { loggdemConfig } from "./interface";
import { getLocation } from "./location";
import colorize from 'json-colorizer';

export class loggdem {
  constructor() {
    this.createLevel('info',
      {
        color: 'royalblue', useTable: true, dateFormat: '', transports: {
          file: {
            path: '',
            tables: true
          },
          http: {
            url: '',
            encrypt: true
          },
          console: true
        },
      },
      (e) => this.configHandler(e, 'info', null))
    this.createLevel('error',
      {
        color: 'red',
        useTable: true,

        transports: {
          file: {
            path: '',
            tables: true
          },
          http: {
            url: '',
            encrypt: true
          },
          console: true
        },
      },
      (e) => this.configHandler(e, 'error', null)
    )
    this.createLevel('debug',
      {
        color: 'orange',
        useTable: true,

        transports: {
          file: {
            path: '',
            tables: true
          },
          http: {
            url: '',
            encrypt: true
          },
          console: true
        },
      },
      (e) => this.configHandler(e, 'debug', null)


    )
    this.createLevel('fatal',
      {
        color: 'red',
        useTable: true,

        transports: {
          file: {
            path: '',
            tables: true
          },
          http: {
            url: '',
            encrypt: true
          },
          console: true
        },
      },
      (e) => {
        this.configHandler(e, 'error', null)
        return process.exit(1)
      }
    )
    this.createTransport('console',
      { level: ['error', 'info',], defaultLevel: 'info' },
      (e, f, g, h) => this.consoleHandler(e, f, g, h)
    )
  }
  private config: loggdemConfig[] = []
  private transports = []
  createLevel(name: string, config?: loggdemConfig, cb: (e: any, g: any) => void = (e, g) => this.configHandler(e, arguments[0], g)) {
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
  setLevel(name: string, config?: loggdemConfig, cb: (e: any, g: any) => void = (e, g) => this.configHandler(e, arguments[0], g)) {
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
  createTransport(name: string, config?: object | Array<object>, cb: (e: any, f: any, g: any) => any = (e, f, g) => { }) {
    let cfg: { level: string[]; default: string; }, transP: {}
    let cfgArray = []
    cfg = { level: ['info'], }
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

    let defFunc = (e: any, f: any, g: any) => {
      console.log(e, f, g)
    }
    if (!cb || typeof cb !== 'function') {
      throw new Error('Callback must be a function')
    }


    Object.defineProperties(transP, {
      name: { value: name, configurable: true, enumerable: true, writable: true },
      cb: { value: cb || defFunc, configurable: true, enumerable: true, writable: true },
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
  setTransport(name: string, config?: object | Array<object>, cb: (e: any, f: any, g: any) => any = (e, f, g, h) => this.consoleHandler(e, f, g, h)) {
    let cfg: { level: string[]; default: string; }, transP: {}
    let cfgArray = []
    cfg = { level: ['info'], defaultLevel: 'info' }
    transP = {}
    if (Array.isArray(config)) {
      cfgArray = Array.from(config)
    } else if (isObject(config)) {
      Object.assign(cfg, config)
      cfgArray.push(cfg)
    } else {
      throw new Error('Config must be an Array or Object')
    }

    let defFunc = (e: any, f: any, g: any) => {
      console.log(e, f, g)
    }
    if (!cb || typeof cb !== 'function') {
      throw new Error('Callback must be a function')
    }


    Object.defineProperties(transP, {
      name: { value: name, configurable: true, enumerable: true, writable: true },
      cb: { value: cb || defFunc, configurable: true, enumerable: true, writable: true },
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
    let filtered = filter ? this.filterArray(tC.config, filter) : tC.config
    tC['cb'].apply(this, [msg, this.getConfig(), filtered])
  }
  private filterArray(array: any[], filters: { [x: string]: (arg0: any) => unknown; }) {
    const filterKeys = Object.keys(filters);
    return array.filter((item: { [x: string]: any; }) => {
      return filterKeys.every(key => {

        if (typeof filters[key] !== 'function') return true;
        return filters[key](item[key]);
      });
    });
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
      f = filter.exclude
    } else {
      f = []
    }
    for (const [key, value] of Object.entries(transP)) {
      if (key && value !== false) {
        this.transports.forEach(o => {
          if (o && o.name == key && value !== false && f.includes(key) == false) {
            o['cb'].apply(this, [e, t, o.config, o.name])
          }
        })
      }
    }
    return
  }
  private methods(method: string, message: string) {
    let useMethod
    let supportedMethods = ['log', 'info', 'error', 'debug']
    let isSupported = supportedMethods.find(x => x == method)
    if (isSupported) {
      useMethod = isSupported
    } else useMethod = 'info'
    return this[`console${useMethod}`](message)
  }
  private consolelog(message: string) {
    console.log(message);
  }
  private consoleinfo(message: string) {
    console.info(message)
  }
  private consoleerror(message: string) {
    console.error(message)
  }
  private consoledebug(message: string) {
    console.debug(message)
  }
  private static jsonify: (obj: object) => string = (obj: object) => {
    if (obj) {
      return JSON.stringify(obj, null, 2)
    }
  }
  private consoleHandler(e: any, f: any, config: any, transportName: string) {
    let dL: any
    let Lconfig = []
    let Co: string | any[]
    const boldify: (text: string) => string = (text: string) => {
      if (text) {
        return chalk['bold'](text)
      }
    }
    const convertColor: (colour: string) => string = (colour: any) => {
      var colours = {
        "aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4", "azure": "#f0ffff",
        "beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd", "blue": "#0000ff", "blueviolet": "#8a2be2", "brown": "#a52a2a", "burlywood": "#deb887",
        "cadetblue": "#5f9ea0", "chartreuse": "#7fff00", "chocolate": "#d2691e", "coral": "#ff7f50", "cornflowerblue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c", "cyan": "#00ffff",
        "darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9", "darkgreen": "#006400", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3", "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", "dodgerblue": "#1e90ff",
        "firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc", "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", "gray": "#808080", "green": "#008000", "greenyellow": "#adff2f",
        "honeydew": "#f0fff0", "hotpink": "#ff69b4",
        "indianred ": "#cd5c5c", "indigo": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c",
        "lavender": "#e6e6fa", "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff", "lightgoldenrodyellow": "#fafad2",
        "lightgrey": "#d3d3d3", "lightgreen": "#90ee90", "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32", "linen": "#faf0e6",
        "magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa", "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370d8", "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a", "mediumturquoise": "#48d1cc", "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead", "navy": "#000080",
        "oldlace": "#fdf5e6", "olive": "#808000", "olivedrab": "#6b8e23", "orange": "#ffa500", "orangered": "#ff4500", "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa", "palegreen": "#98fb98", "paleturquoise": "#afeeee", "palevioletred": "#d87093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f", "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080",
        "rebeccapurple": "#663399", "red": "#ff0000", "rosybrown": "#bc8f8f", "royalblue": "#4169e1",
        "saddlebrown": "#8b4513", "salmon": "#fa8072", "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0", "skyblue": "#87ceeb", "slateblue": "#6a5acd", "slategray": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", "steelblue": "#4682b4",
        "tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8", "tomato": "#ff6347", "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3", "white": "#ffffff", "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00", "yellowgreen": "#9acd32"
      };

      if (typeof colours[colour.toLowerCase()] != 'undefined' || typeof colours[colour.toLowerCase()] != undefined)
        return colours[colour.toLowerCase()];

      return false;
    }
    const checkColor: (colour: string) => string = (colour: any) => {
      let co: string
      let isHexColor1 = /^#[0-9A-F]{6}$/i.test(e)
      let isHexColor2 = /^#([0-9A-F]{3}){1,2}$/i.test(e)

      if (colour) {
        if (isHexColor1 == true || isHexColor2 == true) {
          co = colour
        } else if (convertColor(colour)) {
          co = convertColor(colour)
        } else co = convertColor('white')
      }

      return co
    }
    function manageConfig(objj: { useTable: any; level: any; color: any; tableProperties: any; dateFormat: any; }) {
      const { useTable, level, color, tableProperties, dateFormat } = objj
      let onMissing = function (name: any) {
        return name;
      }
      e = emojify(e, onMissing)
      var output: string
      var locationN: string
      if (useTable && useTable == true) {
        let data = [
          [boldify('level'), boldify('Message'), boldify('Source'), boldify('Date')],
          [chalk.hex(checkColor(color)).bold(level.toUpperCase()), e, getLocation(), moment().format(dateFormat)]
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
        let j = loggdem.jsonify(outp)
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
    if (Lconfig.length == 1) {
      let a = Lconfig[0]
      this.methods(a.level, manageConfig(a))
    } else {
      let infoConfig = Lconfig.find(x => x.level == 'info')
      let errConfig = Lconfig.find(x => x.level == 'error')
      let debugConfig = Lconfig.find(x => x.level == 'debug')
      let fatalConfig = Lconfig.find(x => x.level == 'fatal')
      if (infoConfig) {
        let m = manageConfig(infoConfig)
        this.methods('info', m)
      } if (errConfig) {
        let m = manageConfig(errConfig)
        this.methods('info', m)
      } if (debugConfig) {
        let m = manageConfig(debugConfig)
        this.methods('info', m)
      } if (fatalConfig) {
        let m = manageConfig(fatalConfig)
        this.methods('error', m)
      }
      // this.methods('log', manageConfig(infoConfig))


    }
  }
  private fileHandler(e: any, config: any) {

  }
}