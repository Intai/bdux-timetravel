import R from 'ramda'
import Common from './common-util'

const whenCanUseDOM = R.flip(R.wrap)((func, ...args) => (
  Common.canUseDOM()
    && func.apply(func, args)
))

export default {

  save: R.curryN(2, whenCanUseDOM((name, value) => (
    Promise.resolve(window.sessionStorage
      .setItem(name, JSON.stringify(value)))
  ))),

  load: whenCanUseDOM((name) => {
    var value
    try {
      value = JSON.parse(window.sessionStorage
        .getItem(name))
    } catch (e) {}

    return Promise.resolve(value)
  }),

  remove: whenCanUseDOM((name) => (
    Promise.resolve(window.sessionStorage
      .removeItem(name))
  ))
}
