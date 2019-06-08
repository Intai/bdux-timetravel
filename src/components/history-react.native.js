import * as R from 'ramda'
import React, { useState, useEffect, useMemo } from 'react'
import { TouchableOpacity, TouchableWithoutFeedback, FlatList, View, Text } from 'react-native'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './history-style'
import { useScrollIntoView } from './decorators/scroll-into-view-react.native'
import { createUseBdux } from 'bdux'

const hasHistory = R.pathSatisfies(
  R.is(Array),
  ['timetravel', 'history']
)

const handleRevert = ({ dispatch }, id) => () => {
  dispatch(TimeTravelAction.revert(id))
}

const handleExpand = ({ expandId, setExpandId }, id) => () => {
  setExpandId((expandId === id) ? null : id)
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

const getListItemStyle = ({ expandId }, record) => (
  R.mergeAll([
    styles.item,
    record.anchor && styles.anchor,
    record.id === expandId && styles.expand,
  ])
)

const keyExtractor = (record) => (
  record.id.toString()
)

const getItemLayout = (data, index) => ({
  length: styles.item.height,
  offset: styles.item.height * index,
  index,
})

const renderRecord = R.curry((args, { item: record }) => (
  <View
    key={keyExtractor(record)}
    style={getListItemStyle(args, record)}
  >
    <TouchableOpacity onPress={handleRevert(args, record.id)}>
      <View style={styles.actionTypeWrap}>
        <Text style={styles.actionType}>
          {record.action.type}
        </Text>
      </View>
    </TouchableOpacity>
    <TouchableWithoutFeedback onPress={handleExpand(args, record.id)}>
      <View style={styles.actionParams}>
        {renderParams(record.action)}
      </View>
    </TouchableWithoutFeedback>
  </View>
))

const isLastAnchor = ({ anchor, isLast }) => (
  anchor && isLast
)

const setScrollAnchor = (history, refAnchor) => {
  const index = R.findIndex(isLastAnchor, history)
  const recordId = (index >= 0)
    ? R.nth(index, history).id
    : undefined

  refAnchor.current = {
    getIndex: R.always(index),
    getId: R.always(recordId),
  }
}

const renderHistory = (args) => {
  const { timetravel, refList, refAnchor } = args
  const history = R.reverse(timetravel.history)
  setScrollAnchor(history, refAnchor)

  return (
    <View
      collapsable={false}
      style={styles.wrap}
    >
      <FlatList
        data={history}
        getItemLayout={getItemLayout}
        keyExtractor={keyExtractor}
        renderItem={renderRecord(args)}
        ref={refList}
        style={styles.list}
      />
    </View>
  )
}

const useBdux = createUseBdux({
  timetravel: TimeTravelStore
})

export const History = (props) => {
  const { dispatch, state } = useBdux(props)
  const [expandId, setExpandId] = useState()
  const scrollIntoView = useScrollIntoView()
  useEffect(scrollIntoView.handleUpdate)

  return useMemo(() => (
    hasHistory(state) && renderHistory({
      dispatch,
      expandId,
      setExpandId,
      timetravel: state.timetravel,
      refList: scrollIntoView.refList,
      refAnchor: scrollIntoView.refAnchor,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [dispatch, state.timetravel, expandId, scrollIntoView])
}

export default History
