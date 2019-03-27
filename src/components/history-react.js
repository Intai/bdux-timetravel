import * as R from 'ramda'
import React from 'react'
import TimeTravelStore from '../stores/timetravel-store'
import HistoryItem from './history-item'
import styles from './history-style'
import { scrollIntoView } from './decorators/scroll-into-view-react'
import { createComponent } from 'bdux'

const hasHistory = R.pipe(
  R.path(['timetravel', 'history']),
  R.is(Array)
)

const cleanRef = R.ifElse(
  R.is(Function),
  R.identity,
  R.always(undefined)
)

const renderRecord = R.curry((refAnchor, record) => (
  <HistoryItem
    key={record.id}
    record={record}
    refAnchor={refAnchor}
  />
))

const renderRecords = (refAnchor, timetravel) => (
  R.map(renderRecord(refAnchor), timetravel.history)
)

const getListStyle = (timetravel) => (
  R.mergeAll([
    styles.list,
    !timetravel.showHistory && styles.hide
  ])
)

const renderHistory = ({ timetravel, refList, refAnchor }) => (
  <ul
    ref={cleanRef(refList)}
    style={getListStyle(timetravel)}
  >
    {renderRecords(refAnchor, timetravel)}
  </ul>
)

export const History = (props) => (
  hasHistory(props)
    && renderHistory(props)
)

export default R.compose(
  createComponent({
    timetravel: TimeTravelStore
  }),
  React.memo,
  scrollIntoView
)(History)
