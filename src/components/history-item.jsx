import R from 'ramda'
import React from 'react'
import TimeTravelAction from '../actions/timetravel-action'
import styles from './history-style'
import { pureRender } from './decorators/pure-render'
import { createComponent } from 'bdux'

const onRevert = R.curryN(2, (id) => {
  TimeTravelAction.revert(id)
})

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

const cleanRef = R.ifElse(
  R.is(Function),
  R.identity,
  R.always(undefined)
)

const getListItemStyle = (record) => (
  R.mergeAll([
    styles.item,
    record.anchor && styles.anchor
  ])
)

const renderHistoryItem = ({ record, refAnchor }) => (
  <li
    ref={cleanRef(record.anchor && refAnchor)}
    style={getListItemStyle(record)}
  >
    <div
      onClick={onRevert(record.id)}
      style={styles.actionType}
    >
      {record.action.type}
    </div>

    <ul style={styles.actionParams}>
      {renderParams(record.action)}
    </ul>
  </li>
)

export const HistoryItem = (props) => (
  R.propIs(Object, 'record', props)
    && renderHistoryItem(props)
)

const HistoryItemDecorated = R.compose(
  pureRender
)(HistoryItem)

export default createComponent(HistoryItemDecorated)