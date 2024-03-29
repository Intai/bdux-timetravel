import * as R from 'ramda'
import * as Bacon from 'baconjs'
import ActionTypes from '../actions/action-types'
import StoreNames from '../stores/store-names'
import { createStore } from 'bdux'

const isAction = R.pathEq(
  ['action', 'type']
)

const isHistory = isAction(
  ActionTypes.TIMETRAVEL_HISTORY
)

const isClutch = isAction(
  ActionTypes.TIMETRAVEL_CLUTCH
)

const isDeclutch = isAction(
  ActionTypes.TIMETRAVEL_DECLUTCH
)

const isToggleHistory = isAction(
  ActionTypes.TIMETRAVEL_TOGGLE_HISTORY
)

const mergeState = (name, func) => (
  R.converge(R.mergeWith(R.mergeRight), [
    R.identity,
    R.pipe(
      func,
      R.objOf(name),
      R.objOf('state')
    )
  ])
)

const hasNoAnchor = R.complement(
  R.find(R.prop('anchor'))
)

const setLastAnchor = R.adjust(
  -1, R.mergeLeft({
    anchor: true,
    isLast: true,
  })
)

const anchorLastRecord = R.when(
  hasNoAnchor,
  setLastAnchor
)

const getHistory = R.when(
  isHistory,
  mergeState('history',
    R.pipe(
      R.path(['action', 'history']),
      anchorLastRecord
    )
  )
)

const getClutch = R.when(
  isClutch,
  mergeState('declutch',
    R.always(false))
)

const getDeclutch = R.when(
  isDeclutch,
  mergeState('declutch',
    R.always(true))
)

const toggleHistory = R.when(
  isToggleHistory,
  mergeState('showHistory', R.pipe(
    R.path(['state', 'showHistory']),
    R.not))
)

const getOutputStream = (reducerStream) => (
  reducerStream
    .map(getHistory)
    .map(getClutch)
    .map(getDeclutch)
    .map(toggleHistory)
    .map(R.prop('state'))
    .map(R.defaultTo({
      history: [],
      declutch: false
    }))
)

export const getReducer = () => {
  let reducerStream = new Bacon.Bus()

  return {
    input: reducerStream,
    output: getOutputStream(reducerStream)
  }
}

export default createStore(
  StoreNames.TIMETRAVEL, getReducer
)
