import R from 'ramda'
import React from 'react'
import { TouchableOpacity, ListView, View, Text } from 'react-native'
import TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './history-style'
import { scrollIntoView } from './decorators/scroll-into-view-react'
import { createComponent } from 'bdux'

const hasHistory = R.pipe(
  R.path(['timetravel', 'history']),
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

const isEqualRecord = (record, other) => (
  record.id === other.id
    && !record.anchor === !other.anchor
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

const renderRecord = R.curry((record, refAnchor) => (
  <View ref={ record.anchor && refAnchor }
    style={ getListItemStyle(record) }>

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
))

const updateHistoryDataSource = (dataSource, timetravel) => (
  dataSource.cloneWithRows(timetravel.history)
)

const createHistoryDataSource = (() => {
  let dataSource = new ListView.DataSource({
    rowHasChanged: R.complement(isEqualRecord) })

  return (timetravel) => (
    dataSource = updateHistoryDataSource(dataSource, timetravel)
  )
})()

const renderHistory = ({ timetravel, refWrap, refList, refAnchor }) => (
  <View ref={ refWrap } style={ styles.wrap }>
    <ListView ref={ refList } style={ styles.list }
      dataSource={ createHistoryDataSource(timetravel) }
      renderRow={ renderRecord(R.__, refAnchor) }
      enableEmptySections={ true } />
  </View>
)

export const History = scrollIntoView(
  R.ifElse(
    // if there is a history array.
    hasHistory,
    // render the history.
    renderHistory,
    // otherwise, render nothing.
    R.F
  )
)

export default createComponent(History, {
  timetravel: TimeTravelStore
})
