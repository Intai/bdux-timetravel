import * as R from 'ramda'
import React from 'react'
import Button from './button-react'
import Container from './container-react'
import History from './history-react'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './timetravel-style'
import { pureRender } from './decorators/pure-render'
import { createComponent } from 'bdux'

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

const renderRestart = ({ bindToDispatch }) => (
  <Button
    onClick={bindToDispatch(TimeTravelAction.restart)}
    style={styles.restart}
  >
    Restart
  </Button>
)

const renderClutchButton = ({ bindToDispatch }) => (
  <Button
    onClick={bindToDispatch(TimeTravelAction.clutch)}
    style={styles.clutch}
  >
    Clutch
  </Button>
)

const renderDeclutchButton = ({ bindToDispatch }) => (
  <Button onClick={bindToDispatch(TimeTravelAction.declutch)}>
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

const renderToggleHistory = ({ bindToDispatch, timetravel }) => (
  <Button onClick={bindToDispatch(TimeTravelAction.toggleHistory)}>
    { getToggleHistoryText(timetravel) }
  </Button>
)

export const TimeTravel = (props) => (
  <Container style={getContainerStyle(props)}>
    {renderRestart(props)}
    {renderClutch(props)}
    {renderToggleHistory(props)}
    <History />
  </Container>
)

export default R.pipe(
  pureRender,
  createComponent({
    timetravel: TimeTravelStore
  })
)(TimeTravel)
