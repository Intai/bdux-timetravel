import R from 'ramda'
import { AsyncStorage } from 'react-native'

const save = (name, value) => (
  AsyncStorage.setItem(
    name, JSON.stringify(value))
)

export default {

  save: R.curryN(2, save),
  load: AsyncStorage.getItem,
  remove: AsyncStorage.removeItem
}
