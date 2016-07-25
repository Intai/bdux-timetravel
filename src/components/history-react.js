import R from 'ramda'
import React from 'react'
import TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './history-style'
import { scrollIntoView } from './decorators/scroll-into-view-react'
import { createComponent } from 'bdux'

const onRevert = R.curryN(2, (id) => {
  TimeTravelAction.revert(id)
})

const hasHistory = R.pipe(
  R.defaultTo({}),
  R.prop('history'),
  R.is(Array)
)

const formatValue = (value) => (
  // todo: expandable tree view.
  JSON.stringify(value)
    .replace(/([{,])/g, '$1\n  ')
    .replace(/"(.*)":/g, '$1: ')
    .replace(/}$/, ' }')
)

const renderParam = (value, key) => (
  <li key={ key }>
    <span>{ key }</span>:&nbsp;
    <span style={ styles.actionValue }>
      { formatValue(value) }
    </span>
  </li>
)

const renderParams = R.pipe(
  R.omit(['type']),
  R.mapObjIndexed(renderParam),
  R.values
)

const getListItemStyle = (record) => (
  Object.assign({}, styles.item,
    record.anchor && styles.anchor)
)

const renderRecord = (record) => (
  <li key={ record.id }
    data-anchor={ record.anchor }
    style={ getListItemStyle(record) }>

    <div onClick={ onRevert(record.id) }
      style={ styles.actionType }>
      { record.action.type }
    </div>

    <ul style={ styles.actionParams }>
      { renderParams(record.action) }
    </ul>
  </li>
)

const getListStyle = (timetravel) => (
  Object.assign({}, styles.list,
    !timetravel.showHistory && styles.hide)
)

const renderHistory = (timetravel) => (
  <ul style={ getListStyle(timetravel) }>
    { R.map(renderRecord, timetravel.history) }
  </ul>
)

const render = R.ifElse(
  // if there is a history array.
  hasHistory,
  // render the history.
  renderHistory,
  // otherwise, render nothing.
  R.always(<noscript />)
)

const scrollAnchorIntoView = R.curry(
  scrollIntoView
)(R.__, 'li[data-anchor="true"]')

export const History = scrollAnchorIntoView(
  ({ timetravel }) => (
    render(timetravel)
  )
)

export default createComponent(History, {
  timetravel: TimeTravelStore
})
