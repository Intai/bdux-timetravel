import R from 'ramda'

const PREFIX = 'BDUXTT'

const linebreaks = R.once(() => (
  Array(25).join('\n')
))

const canUseDOM = () => (
  typeof window !== 'undefined'
    && window.document
    && window.document.createElement
)

const canUseDOMOnce = R.once(
  canUseDOM
)

const isReactNative = () => (
  typeof window !== 'undefined'
    && window.navigator
    && window.navigator.product === 'ReactNative'
)

const consoleClear = () => {
  console.log(linebreaks())
}

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

  now: Date.now || (() => (
    (new Date()).getTime()
  )),

  // map an array of strings to
  // object keys and prefixed values.
  createObjOfConsts: R.reduce(
    mapToKeyValue, {}
  ),

  // return a getter and a reload
  // function to create a new instance.
  createInstance
}
