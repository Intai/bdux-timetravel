import * as R from 'ramda'
import Common from './common-util'

export const save = (name, value, fallback) => {
  let currentValue = value
  let count = 0

  // try maximum 5 times.
  while (count < 5) {
    try {
      // could exceed browser's quota for sesseion storage.
      window.sessionStorage
        .setItem(name, JSON.stringify(currentValue))
      break
    } catch (e) {
      if (fallback) {
        // try fallback to another value in case of error.
        currentValue = fallback(currentValue)
        ++count
      } else {
        break
      }
    }
  }
  return Promise.resolve(currentValue)
}

export const load = (name) => {
  let value
  try {
    value = JSON.parse(window.sessionStorage
      .getItem(name))
  } catch (e) {
    // continue regardless of error.
  }
  return Promise.resolve(value)
}

export const remove = (name) => (
  Promise.resolve(window.sessionStorage
    .removeItem(name))
)

export const noop = () => (
  Promise.resolve()
)

export default {

  save: R.ifElse(
    Common.canUseDOM,
    save,
    noop
  ),

  load: R.ifElse(
    Common.canUseDOM,
    load,
    noop
  ),

  remove: R.ifElse(
    Common.canUseDOM,
    remove,
    noop
  )
}
