import * as R from 'ramda'
import React from 'react'
import TimeTravelStore from '../stores/timetravel-store'
import HistoryItem from './history-item'
import styles from './history-style'
import { pureRender } from './decorators/pure-render'
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

const HistoryDecorated = R.compose(
  pureRender,
  scrollIntoView
)(History)

export default createComponent(HistoryDecorated, {
  timetravel: TimeTravelStore
})
