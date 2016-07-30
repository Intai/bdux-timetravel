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
  R.path(['timetravel', 'history']),
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

const renderRecord = R.curry((record, refAnchor) => (
  <li key={ record.id }
    ref={ record.anchor && refAnchor }
    style={ getListItemStyle(record) }>

    <div onClick={ onRevert(record.id) }
      style={ styles.actionType }>
      { record.action.type }
    </div>

    <ul style={ styles.actionParams }>
      { renderParams(record.action) }
    </ul>
  </li>
))

const getListStyle = (timetravel) => (
  Object.assign({}, styles.list,
    !timetravel.showHistory && styles.hide)
)

const renderHistory = ({ timetravel, refList, refAnchor }) => (
  <ul ref={ refList } style={ getListStyle(timetravel) }>
    { R.map(renderRecord(R.__, refAnchor), timetravel.history) }
  </ul>
)

const render = R.ifElse(
  // if there is a history array.
  hasHistory,
  // render the history.
  renderHistory,
  // otherwise, render nothing.
  R.F
)

export const History = scrollIntoView(
  React.createClass({
    render() {
      return render(this.props)
    }
  })
)

export default createComponent(History, {
  timetravel: TimeTravelStore
})
