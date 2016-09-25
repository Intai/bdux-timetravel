import R from 'ramda'
import { AsyncStorage } from 'react-native'

const jsonParse = (json) => {
  try {
    return JSON.parse(json)
  } catch (e) {
    // continue regardless of error.
  }
}

const load = (name) => (
  AsyncStorage.getItem(name)
    .then(jsonParse)
)

const save = (name, value) => (
  AsyncStorage.setItem(
    name, JSON.stringify(value))
)

const remove = (name) => (
  AsyncStorage.removeItem(name)
)

export default {

  load,
  save: R.curryN(2, save),
  remove
}
