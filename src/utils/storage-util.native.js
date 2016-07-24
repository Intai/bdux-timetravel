import R from 'ramda'
import { AsyncStorage } from 'react-native'

const save = (name, value) => (
  AsyncStorage.setItem(
    name, JSON.stringify(value))
)

const jsonParse = (json) => {
  try {
    return JSON.parse(json)
  } catch (e) {}
}

const load = R.pipe(
  AsyncStorage.getItem,
  R.invoker(1, 'then')(jsonParse)
)

export default {

  load,
  save: R.curryN(2, save),
  remove: AsyncStorage.removeItem
}
