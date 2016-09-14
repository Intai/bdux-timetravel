import R from 'ramda'
import Bacon from 'baconjs'
import ActionTypes from './action-types'
import StoreNames from '../stores/store-names'
import Common from '../utils/common-util'
import Storage from '../utils/storage-util'
import Browser from '../utils/browser-util'
import { bindToDispatch } from 'bdux'

const recordStream = new Bacon.Bus()
const revertStream = new Bacon.Bus()
const clearHistoryStream = new Bacon.Bus()

const isNotEmptyArray = R.allPass([
  R.is(Array),
  R.complement(R.isEmpty)
])

const isActionEqual = R.curry((record, timeslice) => (
  timeslice.action.id === record.action.id
))

const hasActionInHistory = (history, record) => (
  // find the same action in history.
  R.find(isActionEqual(record), history)
)

const generateId = (() => {
  let id = Common.now() * 1000
  return () => (++id)
})()

const appendRecordToHistory = (history, record) => (
  // append a new time slice to the history.
  R.append({
    id: generateId(),
    action: record.action,
    records: [record]
  },
  history)
)

const resetAnchor = R.ifElse(
  R.isNil,
  R.always([]),
  R.flip(R.merge)({ anchor: false })
)

const clearHistoryAfterAnchor = R.pipe(
  // split before and from the anchor time slice.
  R.splitWhen(R.prop('anchor')),
  R.converge(
    // concat back together.
    R.concat, [
      // time slices before the anchor.
      R.nth(0),
      // get and reset the anchor.
      R.pipe(R.nth(1), R.head, resetAnchor)
    ]
  )
)

const addRecordToHistory = R.converge(
  appendRecordToHistory, [
    // clear time slices after the anchor.
    clearHistoryAfterAnchor,
    // create a new time slice for the record.
    R.nthArg(1)
  ]
)

const mergeRecord = R.curry((record, timeslice) => (
  // if for the same action.
  (isActionEqual(record, timeslice))
    // merge the record to an existing time slice.
    ? R.mergeWith(R.concat, timeslice, { records: record })
    : timeslice
))

const mergeRecordToHistory = (history, record) => (
  R.map(
    mergeRecord(record),
    history
  )
)

const accumRecords = R.ifElse(
  // if the action has been recorded in history.
  hasActionInHistory,
  // merge to an existing time slice.
  mergeRecordToHistory,
  // otherwise add a new time slice.
  addRecordToHistory
)

const addAnchorToTimeSlice = R.curry((id, timeslice) => (
  R.merge(timeslice, {
    anchor: (id === timeslice.id)
  })
))

const addAnchor = (history, id) => (
  R.map(
    addAnchorToTimeSlice(id),
    history
  )
)

const historyInStorageStream = Bacon.fromPromise(
  Storage.load('bduxHistory'))

const historyProperty = Bacon.update([],
  // restore history from session storage.
  [historyInStorageStream.first().filter(isNotEmptyArray)], R.nthArg(1),
  // accumulate a history of actions and store states.
  [recordStream], accumRecords,
  // anchor at a time slice in history.
  [revertStream], addAnchor,
  // clear the currently accumulated history.
  [clearHistoryStream], R.always([])
)
// save in session storage.
.doAction(Storage.save('bduxHistory'))

const onceThenNull = (func) => {
  let count = 0
  return (...args) => (
    (count++ <= 0)
      ? func.apply(func, args)
      : null
  )
}

const isNotTimeAction = R.pipe(
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

const isNotTimeStore = R.complement(
  R.propEq('name', StoreNames.TIMETRAVEL)
)

const createRevert = (id) => (
  Bacon.combineTemplate({
    type: ActionTypes.TIMETRAVEL_REVERT,
    timeslice: historyProperty
      // find the time slice by id to revert to.
      .map(R.find(R.propEq('id', id))),
    skipLog: true
  })
  .toEventStream()
  .first()
)

const findAnchor = R.converge(R.or, [
  R.find(R.propEq('anchor', true)),
  R.last
])

const createClutch = () => ({
  type: ActionTypes.TIMETRAVEL_CLUTCH,
  skipLog: true
})

const createDeclutch = () => ({
  type: ActionTypes.TIMETRAVEL_DECLUTCH,
  skipLog: true
})

const mergeDeclutchStream = (action) => (
  Bacon.mergeAll(
    Bacon.once(action),
    Bacon.once(createDeclutch())
  )
)

const declutchAfterResume = R.when(
  R.propIs(Object, 'timeslice'),
  mergeDeclutchStream
)

const createResumeToAnchor = () => (
  Bacon.combineTemplate({
    type: ActionTypes.TIMETRAVEL_REVERT,
    timeslice: historyInStorageStream
      // find the anchor time slice to revert to.
      .map(R.defaultTo([]))
      .map(findAnchor),
    skipLog: true
  })
  .flatMap(declutchAfterResume)
  .toEventStream()
)

const createRestart = () => (
  Bacon.fromArray([{
    type: ActionTypes.TIMETRAVEL_REVERT,
    timeslice: [],
    skipLog: true
  },
  // clutch by default after restart.
  createClutch()])
)

const pushRecord = (record) => {
  recordStream.push(record)
}

const pushRevert = (id) => {
  revertStream.push(id)
}

const createStartStream = () => (
  // create an action when history changes.
  Bacon.combineTemplate({
    type: ActionTypes.TIMETRAVEL_HISTORY,
    history: historyProperty,
    skipLog: true
  })
  .changes()
)

// start only once.
export const start = onceThenNull(R.ifElse(
  Common.isOnClient,
  createStartStream,
  R.F
))

// reapply the anchor action and store states.
export const resume = R.ifElse(
  Common.isOnClient,
  createResumeToAnchor,
  R.F
)

export const restart = () => (
  Bacon.fromPromise(
    // remove history from session storage.
    Storage.remove('bduxHistory')
  )
  // reload if in a browser.
  .doAction(Browser.reload)
  // clear console logs.
  .doAction(Common.consoleClear)
  // clear history of actions.
  .doAction(() => clearHistoryStream.push(true))
  // reset all stores.
  .flatMap(createRestart)
)

export const record = R.ifElse(
  // dont record time travel related action and store state.
  R.allPass([isNotTimeAction, isNotTimeStore]),
  // record an action with store states.
  pushRecord,
  R.F
)

export const revert = R.pipe(
  // anchor at a time slice in history.
  R.tap(pushRevert),
  // reapply the action and store states.
  createRevert
)

export const declutch = createDeclutch

export const clutch = createClutch

export const toggleHistory = () => ({
  type: ActionTypes.TIMETRAVEL_TOGGLE_HISTORY,
  skipLog: true
})

export default bindToDispatch({
  start,
  record,
  resume,
  restart,
  revert,
  clutch,
  declutch,
  toggleHistory
})
