import R from 'ramda'
import module from 'module'

const stripPath = R.pipe(
  R.match(/[^/]*$/),
  R.last
)

const stripSuffix = R.replace(
  /\.[^.]*$/, ''
)

const addPlatformToFilename = (platform, filename) => (
  R.when(
    R.is(String),
    R.replace(`${filename}.js`, `${filename}.${platform}.js`)
  )
)

const addPlatform = R.curryN(2, R.useWith(
  addPlatformToFilename, [
    R.identity,
    R.pipe(
      stripPath,
      stripSuffix
    )
  ]
))

const requirePlatform = (platform) => (sandbox, requests) => {
  const findPath = module._findPath
  sandbox.stub(module, '_findPath',
    R.apply(R.pipe)(
      R.prepend(findPath,
        R.map(addPlatform(platform), requests))
    )
  )
}

export const requireIOS = requirePlatform(
  'ios'
)

export const requireAndroid = requirePlatform(
  'android'
)
