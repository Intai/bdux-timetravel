import R from 'ramda'
import Common from './common-util'

const save = (name, value) => (
  Promise.resolve(window.sessionStorage
    .setItem(name, JSON.stringify(value)))
)

const load = (name) => {
  var value
  try {
    value = JSON.parse(window.sessionStorage
      .getItem(name))
  } catch (e) {
    // continue regardless of error.
  }

  return Promise.resolve(value)
}

const remove = (name) => (
  Promise.resolve(window.sessionStorage
    .removeItem(name))
)

const empty = () => (
  Promise.resolve()
)

export default {

  save: R.curryN(2, R.ifElse(
    Common.canUseDOM,
    save,
    empty
  )),

  load: R.ifElse(
    Common.canUseDOM,
    load,
    empty
  ),

  remove: R.ifElse(
    Common.canUseDOM,
    remove,
    empty
  )
}
