import * as R from 'ramda'
import React, { useMemo } from 'react'
import { TouchableOpacity, ListView, View, Text } from 'react-native'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './history-style'
import { useScrollIntoView } from './decorators/scroll-into-view-react.native'
import { createUseBdux } from 'bdux'

const hasHistory = R.pathSatisfies(
  R.is(Array),
  ['timetravel', 'history']
)

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

export const isEqualRecord = (record, other) => (
  record.id === other.id
    && !record.anchor === !other.anchor
)

const renderParam = (value, key) => (
  <Text key={key} style={styles.actionValue}>
    {key}: {formatValue(value)}
  </Text>
)

const renderParams = R.pipe(
  R.omit(['type']),
  R.mapObjIndexed(renderParam),
  R.values
)

const getListItemStyle = (record) => (
  record.anchor && styles.anchor || {}
)

const renderRecord = R.curry((dispatch, refAnchor, record) => (
  <View
    ref={record.anchor ? refAnchor : undefined}
    style={getListItemStyle(record)}
  >
    <TouchableOpacity onPress={onRevert(dispatch, record.id)}>
      <View style={styles.actionTypeWrap}>
        <Text style={styles.actionType}>
          {record.action.type}
        </Text>
      </View>
    </TouchableOpacity>
    <View style={styles.actionParams}>
      {renderParams(record.action)}
    </View>
  </View>
))

const updateHistoryDataSource = (dataSource, timetravel) => (
  dataSource.cloneWithRows(timetravel.history,
    R.reverse(R.range(0, timetravel.history.length)))
)

const createHistoryDataSource = (() => {
  let dataSource = new ListView.DataSource({
    rowHasChanged: R.complement(isEqualRecord) })

  return (timetravel) => (
    dataSource = updateHistoryDataSource(dataSource, timetravel)
  )
})()

const renderHistory = (dispatch, { timetravel }, { refWrap, refList, refAnchor, handleLayout }) => (
  <View
    collapsable={false}
    ref={refWrap}
    style={styles.wrap}
  >
    <ListView
      dataSource={createHistoryDataSource(timetravel)}
      enableEmptySections
      onLayout={handleLayout}
      ref={refList}
      renderRow={renderRecord(dispatch, refAnchor)}
      style={styles.list}
    />
  </View>
)

const useBdux = createUseBdux({
  timetravel: TimeTravelStore
})

export const History = (props) => {
  const { dispatch, state } = useBdux(props)
  const scrollIntoView = useScrollIntoView()

  return useMemo(() => (
    hasHistory(state)
      && renderHistory(dispatch, state, scrollIntoView)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [dispatch, state.timetravel, scrollIntoView])
}

export default History
