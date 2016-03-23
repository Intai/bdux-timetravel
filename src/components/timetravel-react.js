import R from 'ramda';
import React from 'react';
import History from './history-react';
import TimeTravelAction from '../actions/timetravel-action';
import TimeTravelStore from '../stores/timetravel-store';
import classNames from 'classnames/bind';
import styles from './timetravel-react.scss';
import { scrollIntoView } from './decorators/scroll-into-view-react.js';
import { createComponent } from 'bdux'

const cssModule = classNames.bind(styles);

const isDeclutch = R.pipe(
  R.defaultTo({}),
  R.prop('declutch')
);

const renderRestart = () => (
  <button onClick={ TimeTravelAction.restart }
    className={ cssModule({
      'button': true }) }>
    Restart
  </button>
);

const renderClutchButton = () => (
  <button onClick={ TimeTravelAction.clutch }
    className={ cssModule({
      'button': true }) }>
    Clutch
  </button>
);

const renderDeclutchButton = () => (
  <button onClick={ TimeTravelAction.declutch }
    className={ cssModule({
      'button': true }) }>
    Declutch
  </button>
);

const renderClutch = R.ifElse(
  // if declutched from dispatcher.
  isDeclutch,
  // render a button to clutch.
  renderClutchButton,
  // render a button to declutch.
  renderDeclutchButton
);

export const TimeTravel = ({ timetravel }) => (
  <div className={ cssModule({
      'container': true }) }>
    { renderRestart() }
    { renderClutch(timetravel) }
    <History />
  </div>
);

export default createComponent(TimeTravel, {
  timetravel: TimeTravelStore
});
