import AsyncStorage from '@react-native-async-storage/async-storage'

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
  save,
  remove
}
