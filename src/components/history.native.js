import * as R from 'ramda'
import React, { useState, useEffect, useImperativeHandle } from 'react'
import { TouchableOpacity, TouchableWithoutFeedback, FlatList, View, Text } from 'react-native'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './history-style'
import { useScrollIntoView } from './decorators/scroll-into-view'
import { createUseBdux } from 'bdux'

const hasHistory = R.pathSatisfies(
  R.is(Array),
  ['timetravel', 'history']
)

const handleRevert = (dispatch, id) => () => {
  dispatch(TimeTravelAction.revert(id))
}

const handleExpand = (setExpandId, id) => () => {
  setExpandId((prevId) => (prevId === id) ? null : id)
}

const formatValue = (value) => (
  // todo: expandable tree view.
  JSON.stringify(value)
    .replace(/([{,])/g, '$1\n  ')
    .replace(/"(.*)":/g, '$1: ')
    .replace(/}$/, ' }')
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

const getListItemStyle = (expandId, record) => (
  R.mergeAll([
    styles.item,
    record.anchor && styles.anchor,
    record.id === expandId && styles.expand,
  ])
)

const keyExtractor = (record) => (
  `history-record-${record.id}`
)

const getItemLayout = (data, index) => ({
  length: styles.item.height,
  offset: styles.item.height * index,
  index,
})

const renderRecord = ({
  dispatch,
  expandId,
  setExpandId,
}) => ({ item: record }) => (
  <View
    key={keyExtractor(record)}
    style={getListItemStyle(expandId, record)}
  >
    <TouchableOpacity onPress={handleRevert(dispatch, record.id)}>
      <View style={styles.actionTypeWrap}>
        <Text style={styles.actionType}>
          {record.action.type}
        </Text>
      </View>
    </TouchableOpacity>
    <TouchableWithoutFeedback onPress={handleExpand(setExpandId, record.id)}>
      <View style={styles.actionParams}>
        {renderParams(record.action)}
      </View>
    </TouchableWithoutFeedback>
  </View>
)

const isLastAnchor = ({ anchor, isLast }) => (
  anchor && isLast
)

const getHistoryHandle = (state) => {
  if (hasHistory(state)) {
    const history = R.reverse(state.timetravel.history)
    const index = R.findIndex(isLastAnchor, history)
    const recordId = (index >= 0)
      ? R.nth(index, history).id
      : undefined

    return {
      getIndex: R.always(index),
      getId: R.always(recordId),
    }
  }
  return null
}

const useBdux = createUseBdux({
  timetravel: TimeTravelStore
})

export const History = (props) => {
  const { dispatch, state } = useBdux(props)
  const [expandId, setExpandId] = useState()
  const { refList, refAnchor, handleUpdate } = useScrollIntoView()

  useImperativeHandle(props.refAnchor || refAnchor, () => (
    getHistoryHandle(state)
  ), [state])

  useEffect(() => {
    handleUpdate()
  })

  return hasHistory(state) && (
    <View
      collapsable={false}
      style={styles.wrap}
    >
      <FlatList
        data={state.timetravel.history}
        getItemLayout={getItemLayout}
        keyExtractor={keyExtractor}
        renderItem={renderRecord({
          dispatch,
          expandId,
          setExpandId,
        })}
        ref={props.refList || refList}
        style={styles.list}
      />
    </View>
  )
}

export default History
