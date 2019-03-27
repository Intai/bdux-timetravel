import * as R from 'ramda'
import React from 'react'
import { TouchableOpacity, ListView, View, Text } from 'react-native'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './history-style'
import { scrollIntoView } from './decorators/scroll-into-view-react.native'
import { createComponent } from 'bdux'

const hasHistory = R.pipe(
  R.path(['timetravel', 'history']),
  R.is(Array)
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
  R.mergeAll([
    record.anchor && styles.anchor || {}
  ])
)

const renderRecord = R.curry(({ dispatch, refAnchor }, record) => (
  <View ref={record.anchor && refAnchor}
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

const renderHistory = ({ timetravel, refWrap, refList, ...props }) => (
  <View
    collapsable={false}
    ref={refWrap}
    style={styles.wrap}
  >
    <ListView
      {...props}
      dataSource={createHistoryDataSource(timetravel)}
      enableEmptySections
      ref={refList}
      renderRow={renderRecord(props)}
      style={styles.list}
    />
  </View>
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
