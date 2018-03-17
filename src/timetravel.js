import * as R from 'ramda'
import Bacon from 'baconjs'
import Common from './utils/common-util'
import Storage from './utils/storage-util'
import ActionTypes from './actions/action-types'
import StoreNames from './stores/store-names';
import TimeTravelAction from './actions/timetravel-action'

const isOnClient = () => (
  Common.isOnClient()
)

const isAction = R.pathEq(
  ['action', 'type']
)

const isRevert = isAction(
  ActionTypes.TIMETRAVEL_REVERT
)

const isClutch = isAction(
  ActionTypes.TIMETRAVEL_CLUTCH
)

const isDeclutch = isAction(
  ActionTypes.TIMETRAVEL_DECLUTCH
)

const isNotEmptyArray = R.both(
  R.is(Array),
  R.complement(R.isEmpty)
)

const hasTimeslice = R.path(
  ['action', 'timeslice']
)

const findRecordByName = (name, records) => (
  R.find(R.propEq('name', name), records || [])
)

const findTimeRecord = R.converge(
  findRecordByName, [
    R.prop('name'),
    R.path(['action', 'timeslice', 'records'])
  ]
)

const getTimeRecord = R.converge(
  R.defaultTo, [
    R.set(R.lensProp('state'), null),
    findTimeRecord
  ]
)

const isNotTimeStore = R.complement(
  R.propEq('name', StoreNames.TIMETRAVEL)
)

const mapTimeRevert = R.when(
  R.allPass([isRevert, isNotTimeStore, hasTimeslice]),
  getTimeRecord
)

const isNotTimeTravel = R.pipe(
  R.path(['action', 'type']),
  R.flip(R.contains)([
    ActionTypes.TIMETRAVEL_TOGGLE_HISTORY,
    ActionTypes.TIMETRAVEL_HISTORY,
    ActionTypes.TIMETRAVEL_REVERT,
    ActionTypes.TIMETRAVEL_DECLUTCH,
    ActionTypes.TIMETRAVEL_CLUTCH,
    ActionTypes.TIMETRAVEL_IDLE
  ]),
  R.not
)

const mapToIdle = (args) => (
  R.mergeWith(R.merge)(args, {
    action: {
      type: ActionTypes.TIMETRAVEL_IDLE,
      skipLog: true
    }
  })
)

const mapDeclutchToIdle = R.flip(R.ifElse(
  // if was declutched and not time travelling.
  R.both(R.nthArg(1), isNotTimeTravel),
  // change the action to do nothing.
  mapToIdle,
  // otherwise continue reducing.
  R.nthArg(0)
))

const createHistoryProperty = () => (
  Bacon.fromPromise(
    Storage.load('bduxHistory'))
  .toProperty()
)

export const historyInStorageProperty = Common.createInstance(
  createHistoryProperty
)

const createHistoryValve = () => (
  historyInStorageProperty.get()
    .map(R.F)
    .startWith(true)
)

const initDeclutchProperty = (declutchStream) => {
  declutchStream.plug(
    // declutch by default when resuming from session storage.
    historyInStorageProperty.get()
      .toEventStream()
      .first()
      .map(isNotEmptyArray)
  )
}

const reloadDeclutchProperty = (declutchStream) => () => {
  declutchStream.push(false)
  initDeclutchProperty(declutchStream)
}

const plugDeclutchStream = R.curry((declutchStream, preStream) => {
  declutchStream.plug(
    // whether currently clutched to dispatcher.
    Bacon.mergeAll(
      preStream
        .filter(isClutch)
        .map(R.F),
      preStream
        .filter(isDeclutch)
        .map(R.T)
    )
  )
})

export const declutchProperty = (() => {
  const declutchStream = new Bacon.Bus()
  const declutchProperty = declutchStream.toProperty(false)
  initDeclutchProperty(declutchStream)

  return {
    reload: reloadDeclutchProperty(declutchStream),
    get: R.pipe(
      plugDeclutchStream(declutchStream),
      R.always(declutchProperty)
    )
  }
})()

const shouldDisableResume = R.both(
  R.nthArg(1),
  isNotTimeTravel
)

const disableResume = R.pipe(
  () => TimeTravelAction.disableResume(),
  R.F
)

const disableResumeAfterHadRevert = R.cond([
  [isRevert, R.T],
  [shouldDisableResume, disableResume],
  [R.T, R.nthArg(1)]
])

const disableResumeAfterRevert = (() => {
  let hadRevert = false
  return (args) => {
    hadRevert = disableResumeAfterHadRevert(args, hadRevert)
  }
})();

const getPreOutputOnClient = (preStream) => (
  Bacon.when([
    declutchProperty.get(preStream),
    // wait for storage.
    preStream.holdWhen(createHistoryValve())
  // filter out actions while declutched.
  ], mapDeclutchToIdle)
  // record the action and store states.
  .doAction(TimeTravelAction.record)
  // disable resuming after done reverting.
  .doAction(disableResumeAfterRevert)
  // handle revert action.
  .map(mapTimeRevert)
)

const getPreOutput = R.ifElse(
  isOnClient,
  getPreOutputOnClient,
  R.identity
)

export const getPreReduce = () => {
  const preStream = new Bacon.Bus()

  // start recording.
  TimeTravelAction.start()

  return {
    input: preStream,
    output: getPreOutput(preStream)
  }
}
