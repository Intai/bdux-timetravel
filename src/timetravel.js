import R from 'ramda'
import Bacon from 'baconjs'
import Common from './utils/common-util'
import Storage from './utils/storage-util'
import ActionTypes from './actions/action-types'
import StoreNames from './stores/store-names';
import TimeTravelAction from './actions/timetravel-action.js'

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

const isNotEmptyArray = R.allPass([
  R.is(Array),
  R.complement(R.isEmpty)
])

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
  R.nthArg(0),
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

const mapDeclutchToIdle = R.ifElse(
  // if was declutched and not time travelling.
  R.allPass([R.nthArg(1), isNotTimeTravel]),
  // change the action to do nothing.
  mapToIdle,
  // otherwise continue reducing.
  R.nthArg(0)
)

const getDeclutchStream = (preStream) => (
  Bacon.mergeAll(
    preStream
      .filter(isClutch)
      .map(R.F),
    preStream
      .filter(isDeclutch)
      .map(R.T)
  )
)

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

const getDeclutchProperty = (preStream) => (
  Bacon.mergeAll(
    // declutch by default when resuming from session storage.
    historyInStorageProperty.get()
      .first()
      .map(isNotEmptyArray),

    // whether currently clutched to dispatcher.
    getDeclutchStream(preStream)
  )
  .toProperty()
)

const getPreOutputOnClient = (preStream) => (
  Bacon.when([
    // wait for storage.
    preStream.holdWhen(createHistoryValve()),
    // filter out actions while declutched.
    getDeclutchProperty(preStream)], mapDeclutchToIdle)
  // record the action and store states.
  .doAction(TimeTravelAction.record)
  // handle revert action.
  .map(mapTimeRevert)
)

const getPreOutput = R.ifElse(
  isOnClient,
  getPreOutputOnClient,
  R.identity
)

export const getPreReduce = () => {
  let preStream = new Bacon.Bus()

  // start recording.
  TimeTravelAction.start()

  return {
    input: preStream,
    output: getPreOutput(preStream)
  }
}
