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

const isReactNative = () => (
  typeof window !== 'undefined'
    && window.navigator
    && window.navigator.product === 'ReactNative'
)

const mapToKeyValue = (obj, key) => {
  obj[key] = PREFIX + '_' + key
  return obj
}

export default {

  canUseDOM: R.once(
    canUseDOM
  ),

  isReactNative: R.once(
    isReactNative
  ),

  isOnClient: R.once(
    R.anyPass([
      canUseDOM,
      isReactNative
    ])
  ),

  consoleClear: () => {
    console.log(linebreaks())
  },

  now: Date.now || (() => (
    (new Date()).getTime()
  )),

  // map an array of strings to
  // object keys and prefixed values.
  createObjOfConsts: R.reduce(
    mapToKeyValue, {}
  )
}
