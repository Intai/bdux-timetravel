import R from 'ramda';
import React from 'react';
import TimeTravelAction from '../actions/timetravel-action';
import TimeTravelStore from '../stores/timetravel-store';
import classNames from 'classnames/bind';
import styles from './history-react.scss';
import { scrollIntoView } from './decorators/scroll-into-view-react.js';
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

const formatValue = (value) => (
  // todo: expandable tree view.
  JSON.stringify(value)
    .replace(/([{,])/g, '$1\n  ')
    .replace(/"(.*)":/g, '$1: ')
    .replace(/}$/, ' }')
);

const renderParam = (value, key) => (
  <li key={ key }>
    <span>{ key }</span>:&nbsp;
    <span className={ cssModule({
        'action-value': true }) }>
      { formatValue(value) }
    </span>
  </li>
);

const renderParams = R.pipe(
  R.omit(['type']),
  R.mapObjIndexed(renderParam),
  R.values
);

const renderRecord = (record) => (
  <li key={ record.id }
    data-anchor={ record.anchor }
    className={ cssModule({
      'item': true,
      'anchor': record.anchor}) }>

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

const render = R.ifElse(
  // if there is a history array.
  hasHistory,
  // render the history.
  renderHistory,
  // otherwise, render nothing.
  R.always(<noscript />)
);

const scrollAnchorIntoView = R.curry(
  scrollIntoView
)(R.__, 'li[data-anchor="true"]');

export const History = scrollAnchorIntoView(
  ({ timetravel }) => (
    render(timetravel)
  )
);

export default createComponent(History, {
  timetravel: TimeTravelStore
});
