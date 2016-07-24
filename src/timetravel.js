import R from 'ramda'
import Bacon from 'baconjs'
import Common from './utils/common-util'
import Storage from './utils/storage-util'
import StoreNames from './stores/store-names'
import ActionTypes from './actions/action-types'
import TimeTravelAction from './actions/timetravel-action.js'

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

const mapTimeRevert = R.when(
  isRevert,
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

const historyInStorageStream = Bacon.fromPromise(
  Storage.load('bduxHistory'))

const historyInStorageValve = historyInStorageStream
  .map(R.F)
  .toProperty(true)

const getDeclutchProperty = (preStream) => (
  Bacon.mergeAll(
    // declutch by default when resuming from session storage.
    historyInStorageStream
      .first()
      .map(R.is(Array)),

    // whether currently clutched to dispatcher.
    getDeclutchStream(preStream)
  )
  .toProperty()
)

const getPreOutputStream = (preStream) => (
  Bacon.when([
    // wait for storage.
    preStream.holdWhen(historyInStorageValve),
    // filter out actions while declutched.
    getDeclutchProperty(preStream)], mapDeclutchToIdle)
  // record the action and store states.
  .doAction(TimeTravelAction.record)
  // handle revert action.
  .map(mapTimeRevert)
)

export const getPreReduce = () => {
  let preStream = new Bacon.Bus()

  // start recording.
  TimeTravelAction.start();

  return {
    input: preStream,
    output: getPreOutputStream(preStream)
  }
}
