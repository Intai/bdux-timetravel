import R from 'ramda';
import Bacon from 'baconjs';
import ActionTypes from '../actions/action-types';
import StoreNames from '../stores/store-names';
import { createStore } from 'bdux';

const isAction = R.pathEq(
  ['action', 'type']
);

const isHistory = isAction(
  ActionTypes.TIMETRAVEL_HISTORY
);

const isClutch = isAction(
  ActionTypes.TIMETRAVEL_CLUTCH
);

const isDeclutch = isAction(
  ActionTypes.TIMETRAVEL_DECLUTCH
);

const mergeState = (name, func) => (
  R.converge(R.mergeWith(R.merge), [
    R.identity,
    R.pipe(
      func,
      R.objOf(name),
      R.objOf('state')
    )
  ])
);

const getHistory = R.when(
  isHistory,
  mergeState('history',
    R.path(['action', 'history']))
);

const getClutch = R.when(
  isClutch,
  mergeState('declutch',
    R.always(false))
);

const getDeclutch = R.when(
  isDeclutch,
  mergeState('declutch',
    R.always(true))
);

const getOutputStream = (reducerStream) => (
  reducerStream
    .map(getHistory)
    .map(getClutch)
    .map(getDeclutch)
    .map(R.prop('state'))
    .map(R.defaultTo({
      history: [],
      declutch: false
    }))
);

export const getReducer = () => {
  let reducerStream = new Bacon.Bus();

  return {
    input: reducerStream,
    output: getOutputStream(reducerStream)
  };
};

export default createStore(
  StoreNames.TIMETRAVEL, getReducer
);
