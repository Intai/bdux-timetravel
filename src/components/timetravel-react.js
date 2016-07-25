import R from 'ramda'
import React from 'react'
import Button from './button-react'
import Container from './container-react'
import History from './history-react'
import TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './timetravel-style'
import { createComponent } from 'bdux'

const isDeclutch = R.pipe(
  R.defaultTo({}),
  R.prop('declutch')
)

const getContainerStyle = (timetravel) => (
  Object.assign({}, styles.container,
    !shouldShowHistory(timetravel) && styles.hideHistory || {}
  )
)

const renderRestart = () => (
  <Button onClick={ TimeTravelAction.restart }
    style={ styles.restart }>
    Restart
  </Button>
)

const renderClutchButton = () => (
  <Button onClick={ TimeTravelAction.clutch }
    style={ styles.clutch }>
    Clutch
  </Button>
)

const renderDeclutchButton = () => (
  <Button onClick={ TimeTravelAction.declutch }>
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

const shouldShowHistory = (timetravel) => (
  timetravel && timetravel.showHistory
)

const getToggleHistoryText = (timetravel) => (
  shouldShowHistory(timetravel)
    ? 'Hide History'
    : 'Show History'
)

const renderToggleHistory = (timetravel) => (
  <Button onClick={ TimeTravelAction.toggleHistory }>
    { getToggleHistoryText(timetravel) }
  </Button>
)

export const TimeTravel = ({ timetravel }) => (
  <Container style={ getContainerStyle(timetravel) }>
    { renderRestart() }
    { renderClutch(timetravel) }
    { renderToggleHistory(timetravel) }

    <History />
  </Container>
)

export default createComponent(TimeTravel, {
  timetravel: TimeTravelStore
},
// resume from session storage.
TimeTravelAction.resume)
