import * as R from 'ramda'
import React from 'react'
import * as TimeTravelAction from '../actions/timetravel-action'
import styles from './history-style'
import { useBdux } from 'bdux'

const onRevert = (dispatch, id) => () => {
  dispatch(TimeTravelAction.revert(id))
}

const formatValue = (value) => (
  // todo: expandable tree view.
  JSON.stringify(value)
    .replace(/([{,])/g, '$1\n  ')
    .replace(/"(.*)":/g, '$1: ')
    .replace(/}$/, ' }')
)

const renderParam = (value, key) => (
  <li key={key}>
    <span>{key}</span>:&nbsp;
    <span style={styles.actionValue}>
      {formatValue(value)}
    </span>
  </li>
)

const renderParams = R.pipe(
  R.omit(['type']),
  R.mapObjIndexed(renderParam),
  R.values
)

const getListItemStyle = (record) => (
  R.mergeAll([
    styles.item,
    record.anchor && styles.anchor
  ])
)

const renderHistoryItem = ({ dispatch, record, refAnchor }) => (
  <li
    ref={record.anchor ? refAnchor : undefined}
    style={getListItemStyle(record)}
  >
    <div
      onClick={onRevert(dispatch, record.id)}
      style={styles.actionType}
    >
      {record.action.type}
    </div>

    <ul style={styles.actionParams}>
      {renderParams(record.action)}
    </ul>
  </li>
)

export const HistoryItem = (props) => {
  useBdux(props)
  return R.propIs(Object, 'record', props)
    && renderHistoryItem(props)
}

export default React.memo(HistoryItem)
