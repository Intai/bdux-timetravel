import * as R from 'ramda'
import Common from './common-util'

export const save = (name, value) => (
  Promise.resolve(window.sessionStorage
    .setItem(name, JSON.stringify(value)))
)

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

  save: R.curryN(2, R.ifElse(
    Common.canUseDOM,
    save,
    noop
  )),

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
