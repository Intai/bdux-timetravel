import * as R from 'ramda'
import React, { useCallback, useMemo } from 'react'
import Button from './button'
import Container from './container'
import History from './history'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './timetravel-style'
import { createUseBdux } from 'bdux'

const isDeclutch = R.path(
  ['timetravel', 'declutch']
)

const shouldShowHistory = (timetravel) => (
  timetravel && timetravel.showHistory
)

const getContainerStyle = ({ timetravel }) => (
  R.mergeAll([
    styles.container,
    !shouldShowHistory(timetravel) && styles.hideHistory || {}
  ])
)

const renderRestart = (restart) => (
  <Button
    onClick={restart}
    style={styles.restart}
  >
    Restart
  </Button>
)

const renderClutchButton = (state, clutch) => (
  <Button
    onClick={clutch}
    style={styles.clutch}
  >
    Clutch
  </Button>
)

const renderDeclutchButton = (state, clutch, declutch) => (
  <Button onClick={declutch}>
    Declutch
  </Button>
)

const renderClutch = R.ifElse(
  // if declutched from dispatcher.
  isDeclutch,
  // render a button to clutch.
  renderClutchButton,
  // render a button to declutch.
  renderDeclutchButton
)

const getToggleHistoryText = (timetravel) => (
  shouldShowHistory(timetravel)
    ? 'Hide History'
    : 'Show History'
)

const renderToggleHistory = ({ timetravel }, toggleHistory) => (
  <Button onClick={toggleHistory}>
    { getToggleHistoryText(timetravel) }
  </Button>
)

const useBdux = createUseBdux({
  timetravel: TimeTravelStore
})

export const TimeTravel = (props) => {
  const { bindToDispatch, state } = useBdux(props)
  const restart = useCallback(bindToDispatch(TimeTravelAction.restart), [bindToDispatch])
  const clutch = useCallback(bindToDispatch(TimeTravelAction.clutch), [bindToDispatch])
  const declutch = useCallback(bindToDispatch(TimeTravelAction.declutch), [bindToDispatch])
  const toggleHistory = useCallback(bindToDispatch(TimeTravelAction.toggleHistory), [bindToDispatch])
  const containerProps = useMemo(() => ({
    style: getContainerStyle(state),
    children: <>
      {renderRestart(restart)}
      {renderClutch(state, clutch, declutch)}
      {renderToggleHistory(state, toggleHistory)}
      <History />
    </>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [bindToDispatch, state.timetravel])

  return <Container {...containerProps} />
}

export default React.memo(TimeTravel)
