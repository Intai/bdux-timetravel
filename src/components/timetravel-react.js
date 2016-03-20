import R from 'ramda';
import React from 'react';
import TimeTravelAction from '../actions/timetravel-action';
import TimeTravelStore from '../stores/timetravel-store';
import classNames from 'classnames/bind';
import styles from './timetravel-react.scss';
import { createComponent } from 'bdux'

const cssModule = classNames.bind(styles);

const onRevert = R.curryN(2, (id) => {
  TimeTravelAction.revert(id);
});

const hasHistory = R.pipe(
  R.defaultTo({}),
  R.prop('history'),
  R.is(Array)
);

const isDeclutch = R.pipe(
  R.defaultTo({}),
  R.prop('declutch')
);

const renderParam = (value, key) => (
  <li key={ key }>
    <span>{ key }</span>:
    <span>{ value }</span>
  </li>
);

const renderParams = R.pipe(
  R.omit(['type']),
  R.mapObjIndexed(renderParam),
  R.values
);

const renderRecord = (record) => (
  <li key={ record.id }
    className={ cssModule({
      'item': true }) }>

    <div onClick={ onRevert(record.id) }
      className={ cssModule({
        'action-type': true }) }>
      { record.action.type }
    </div>

    <ul className={ cssModule({
        'action-params': true }) }>
      { renderParams(record.action) }
    </ul>
  </li>
);

const renderHistory = (timetravel) => (
  <ul className={ cssModule({
      'list': true }) }>
    { R.map(renderRecord, timetravel.history) }
  </ul>
);

const renderTimeTravel = R.ifElse(
  // if there is a history array.
  hasHistory,
  // render the history.
  renderHistory,
  // otherwise, render nothing.
  R.always(<noscript />)
);

const renderClutchButton = () => (
  <button onClick={ TimeTravelAction.clutch }
    className={ cssModule({
      'button': true }) }>
    CLUTCH
  </button>
);

const renderDeclutchButton = () => (
  <button onClick={ TimeTravelAction.declutch }
    className={ cssModule({
      'button': true }) }>
    DECLUTCH
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
    { renderClutch(timetravel) }
    { renderTimeTravel(timetravel) }
  </div>
);

export default createComponent(TimeTravel, {
  timetravel: TimeTravelStore
});
