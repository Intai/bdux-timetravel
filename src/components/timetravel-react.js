import R from 'ramda'
import React from 'react'
import Container from './container-react'
//import History from './history-react'
import TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import styles from './timetravel-style'
import { createComponent } from 'bdux'

const isDeclutch = R.pipe(
  R.defaultTo({}),
  R.prop('declutch')
)

/*const renderRestart = () => (
  <button onClick={ TimeTravelAction.restart }
    className={ cssModule({
      'button': true }) }>
    Restart
  </button>
)

const renderClutchButton = () => (
  <button onClick={ TimeTravelAction.clutch }
    className={ cssModule({
      'button': true,
      'clutch': true }) }>
    Clutch
  </button>
)

const renderDeclutchButton = () => (
  <button onClick={ TimeTravelAction.declutch }
    className={ cssModule({
      'button': true }) }>
    Declutch
  </button>
)

const renderClutch = R.ifElse(
  // if declutched from dispatcher.
  isDeclutch,
  // render a button to clutch.
  renderClutchButton,
  // render a button to declutch.
  renderDeclutchButton
)*/

const shouldShowHistory = (timetravel) => (
  timetravel && timetravel.showHistory
)

/*const getToggleHistoryText = (timetravel) => (
  shouldShowHistory(timetravel)
    ? 'Hide History'
    : 'Show History'
)

const renderToggleHistory = (timetravel) => (
  <button onClick={ TimeTravelAction.toggleHistory }
    className={ cssModule({
      'button': true }) }>
    { getToggleHistoryText(timetravel) }
  </button>
)*/

export const TimeTravel = ({ timetravel }) => (
  <Container style={[ styles.container,
    !shouldShowHistory(timetravel) && styles.hideHistory ]}>
    {/*{ renderRestart() }
    { renderClutch(timetravel) }
    { renderToggleHistory(timetravel) }

    <History />*/}
  </Container>
)

export default createComponent(TimeTravel, {
  timetravel: TimeTravelStore
},
// resume from session storage.
TimeTravelAction.resume)
