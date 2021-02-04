import { isObject, isString } from "lodash"

interface config {
  color: string,
  formatDate: boolean,
  location: boolean,
  emoji: boolean
}

const defConfig: config = {
  color: 'green',
  formatDate: true,
  location: true,
  emoji: true
}

const level: any = {}
const addLevel = (name: string, config: config) => {
  if (!name || !isString(name)) {
    return false
  }
  if (config && !isObject(config)) {
    return false
  }
  if (level[name]) {
    return 'Exists'
  }
  try {
    return Object.defineProperty(level, name, { value: config })
  } catch (error) {
    return error
  }
}

const setLevel = (name: string, config: config) => {
  if (!name || !isString(name)) {
    return false
  }
  if (config && !isObject(config)) {
    return false
  }
  if (!level[name]) {
    return 'Does not exist'
  }
  try {
    return Object.defineProperty(level, name, { value: config })
  } catch (error) {
    return error
  }
}

const levelMethods = () => {

}

export { addLevel, setLevel, level }