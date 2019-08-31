import * as R from 'ramda'
import * as Bacon from 'baconjs'
import ActionTypes from './action-types'
import StoreNames from '../stores/store-names'
import Common from '../utils/common-util'
import Storage from '../utils/storage-util'
import Browser from '../utils/browser-util'

const recordStream = new Bacon.Bus()
const resumeStream = new Bacon.Bus()
const revertStream = new Bacon.Bus()
const clearHistoryStream = new Bacon.Bus()
const filterResumeStream = new Bacon.Bus()

const isOnClient = () => (
  Common.isOnClient()
)

const isNotEmptyArray = R.both(
  R.is(Array),
  R.complement(R.isEmpty)
)

const isActionEqual = R.curry((record, timeslice) => (
  timeslice.action && record.action
    && timeslice.action.id === record.action.id
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
  R.pipe(
    R.flip(R.merge)({ anchor: false }),
    R.of
  )
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
    ? R.mergeWith(R.concat, timeslice, { records: [record] })
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

const createHistoryStream = () => (
  Bacon.fromPromise(
    Storage.load('bduxHistory'))
)

export const historyInStorageStream = Common.createInstance(
  createHistoryStream
)

const createHistoryProperty = () => (
  Bacon.update([],
    // restore history from session storage.
    [historyInStorageStream.get().first().filter(isNotEmptyArray)], R.nthArg(1),
    // accumulate a history of actions and store states.
    [recordStream], accumRecords,
    // anchor at a time slice in history.
    [revertStream], addAnchor,
    // clear the currently accumulated history.
    [clearHistoryStream], R.always([])
  )
)

export const historyProperty = Common.createInstance(
  createHistoryProperty
)

const onceThenNull = (func) => {
  let count = 0
  return () => (
    (count++ <= 0)
      ? func()
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
    timeslice: historyProperty.get()
      // find the time slice by id to revert to.
      .map(R.find(R.propEq('id', id))),
    skipLog: true
  })
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

const enableResume = () => {
  filterResumeStream.push(true)
}

export const disableResume = () => {
  filterResumeStream.push(false)
}

const declutchToResume = () => (
  historyInStorageStream.get()
    .first()
    .filter(isNotEmptyArray)
    .map(createDeclutch)
    .doAction(enableResume)
)

const getResumeValve = () => (
  historyInStorageStream.get()
    .map(R.F)
    .toProperty(true)
)

const getResumeStream = () => (
  resumeStream
    .holdWhen(getResumeValve())
    .filter(filterResumeStream.toProperty(false))
    .debounce(1)
)

const createResumeToAnchor = () => (
  Bacon.combineTemplate({
    type: ActionTypes.TIMETRAVEL_REVERT,
    timeslice: historyProperty.get()
      // find the anchor time slice to revert to.
      .map(R.defaultTo([]))
      .map(findAnchor),
    skipLog: true
  })
  // debounce to reduce unnecessary resumes.
  .sampledBy(getResumeStream(), R.identity)
)

const createStorageSave = () => (
  historyProperty.get()
    .changes()
    .debounce(500)
    // save in session storage.
    .doAction(Storage.save('bduxHistory'))
    .filter(R.F)
)

const createRestart = () => (
  Bacon.fromArray([{
    type: ActionTypes.TIMETRAVEL_REVERT,
    timeslice: undefined,
    skipLog: true
  },
  // clutch by default after restart.
  createClutch()])
)

const pushRecord = (record) => {
  recordStream.push(record)
}

const pushResume = () => {
  resumeStream.push(true)
}

const pushRevert = (id) => {
  revertStream.push(id)
}

const createStartStream = () => (
  // create an action when history changes.
  Bacon.combineTemplate({
    type: ActionTypes.TIMETRAVEL_HISTORY,
    history: historyProperty.get(),
    skipLog: true
  })
  .changes()
)

export const start = R.ifElse(
  isOnClient,
  R.converge(
    Bacon.mergeAll, [
      createStartStream,
      createResumeToAnchor,
      createStorageSave,
      declutchToResume
    ]
  ),
  R.F
)

export const startOnce = onceThenNull(
  start
)

// reapply the anchor action and store states.
export const resume = R.ifElse(
  isOnClient,
  pushResume,
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
  R.both(isNotTimeAction, isNotTimeStore),
  // record an action with store states.
  pushRecord,
  R.F
)

export const revert = R.pipe(
  // enable resuming from history.
  R.tap(enableResume),
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
