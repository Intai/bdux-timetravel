import * as R from 'ramda'
import React, { useMemo } from 'react'
import TimeTravelStore from '../stores/timetravel-store'
import HistoryItem from './history-item'
import styles from './history-style'
import { useScrollIntoView } from './decorators/scroll-into-view-react'
import { createUseBdux } from 'bdux'

const hasHistory = R.pathSatisfies(
  R.is(Array),
  ['timetravel', 'history']
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

const renderHistory = ({ timetravel }, refList, refAnchor) => (
  <ul
    ref={refList}
    style={getListStyle(timetravel)}
  >
    {renderRecords(refAnchor, timetravel)}
  </ul>
)

const useBdux = createUseBdux({
  timetravel: TimeTravelStore
})

export const History = (props) => {
  const { state } = useBdux(props)
  const { refList, refAnchor } = useScrollIntoView()

  return useMemo(() => (
    hasHistory(state)
      && renderHistory(state, refList, refAnchor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [state.timetravel, refList, refAnchor])
}

export default History
