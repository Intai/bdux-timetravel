import R from 'ramda'
import React from 'react';
import { TouchableOpacity, ListView, View, Text } from 'react-native'
import TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store';
import styles from './history-style'
import { createComponent } from 'bdux'

const hasHistory = R.pipe(
  R.defaultTo({}),
  R.prop('history'),
  R.is(Array)
)

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
  <Text key={ key } style={ styles.actionValue }>
    { key }: { formatValue(value) }
  </Text>
)

const renderParams = R.pipe(
  R.omit(['type']),
  R.mapObjIndexed(renderParam),
  R.values
)

const getListItemStyle = (record) => (
  Object.assign({},
    record.anchor && styles.anchor || {})
)

const renderRecord = (record) => (
  <View style={ getListItemStyle(record) }>
    <TouchableOpacity onPress={ onRevert(record.id) }>
      <View style={ styles.actionTypeWrap }>
        <Text style={ styles.actionType }>
          { record.action.type }
        </Text>
      </View>
    </TouchableOpacity>

    <View style={ styles.actionParams }>
      { renderParams(record.action) }
    </View>
  </View>
)

const updateHistoryDataSource = (dataSource, timetravel) => (
  dataSource.cloneWithRows(timetravel.history)
)

const createHistoryDataSource = (() => {
  let dataSource = new ListView.DataSource({
    rowHasChanged: R.complement(R.eqBy(R.prop('id'))) })

  return (timetravel) => (
    dataSource = updateHistoryDataSource(dataSource, timetravel)
  )
})()

const renderHistory = (timetravel) => (
  <ListView style={ styles.list }
    dataSource={ createHistoryDataSource(timetravel) }
    renderRow={ renderRecord }
    enableEmptySections={ true } />
)

const render = R.ifElse(
  // if there is a history array.
  hasHistory,
  // render the history.
  renderHistory,
  // otherwise, render nothing.
  R.always(<View />)
)

export const History = ({ timetravel }) => (
  render(timetravel)
)

export default createComponent(History, {
  timetravel: TimeTravelStore
})