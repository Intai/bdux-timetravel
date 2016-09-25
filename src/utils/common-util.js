import R from 'ramda'

const PREFIX = 'BDUXTT'

const linebreaks = R.once(() => (
  Array(25).join('\n')
))

export const canUseDOM = () => (
  typeof window !== 'undefined'
    && window.document
    && window.document.createElement
)

const canUseDOMOnce = R.once(
  canUseDOM
)

export const isReactNative = () => (
  typeof window !== 'undefined'
    && window.navigator
    && window.navigator.product === 'ReactNative'
)

export const consoleClear = () => {
  console.log(linebreaks())
}

export const getTimeFunc = () => (
  Date.now || (() => new Date().getTime())
)

const mapToKeyValue = (obj, key) => {
  obj[key] = PREFIX + '_' + key
  return obj
}

const createInstance = (factory) => {
  let instance = factory()

  return {
    get: () => instance,
    reload: () => (
      instance = factory()
    )
  }
}

export default {

  canUseDOM: canUseDOMOnce,

  isReactNative: R.once(
    isReactNative
  ),

  isOnClient: R.once(
    R.anyPass([
      canUseDOM,
      isReactNative
    ])
  ),

  consoleClear: R.when(
    canUseDOMOnce,
    consoleClear
  ),

  now: getTimeFunc(),

  // map an array of strings to
  // object keys and prefixed values.
  createObjOfConsts: (values) => R.reduce(
    mapToKeyValue, {}, values
  ),

  // return a getter and a reload
  // function to create a new instance.
  createInstance
}
