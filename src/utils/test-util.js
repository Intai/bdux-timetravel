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

const addPlatformByKey = (requests, key) => (
  R.map(addPlatform(key), requests)
);

const addPlatforms = R.pipe(
  R.mapObjIndexed(addPlatformByKey),
  R.values,
  R.flatten
)

export const requirePlatform = (sandbox, requests) => {
  const findPath = module._findPath
  sandbox.stub(module, '_findPath',
    R.apply(R.pipe)(
      R.prepend(findPath,
        addPlatforms(requests))
    )
  )
}

export const requireIOS = R.useWith(
  requirePlatform, [
    R.identity,
    R.objOf('ios')
  ]
)

export const requireAndroid = R.useWith(
  requirePlatform, [
    R.identity,
    R.objOf('android')
  ]
)
