import R from 'ramda';
import Bacon from 'baconjs';
import Storage from './utils/storage-util';
import ActionTypes from './actions/action-types';
import TimeTravelAction from './actions/timetravel-action.js';

const isAction = R.pathEq(
  ['action', 'type']
);

const isRevert = isAction(
  ActionTypes.TIMETRAVEL_REVERT
);

const isClutch = isAction(
  ActionTypes.TIMETRAVEL_CLUTCH
);

const isDeclutch = isAction(
  ActionTypes.TIMETRAVEL_DECLUTCH
);

const findRecordByName = (name, records) => (
  R.find(R.propEq('name', name), records)
);

const findTimeRecord = R.converge(
  findRecordByName, [
    R.prop('name'),
    R.path(['action', 'timeslice', 'records'])
  ]
);

const getTimeRecord = R.converge(
  R.defaultTo, [
    R.identity,
    findTimeRecord
  ]
);

const mapTimeRevert = R.when(
  isRevert,
  getTimeRecord
);

const isNotTimeTravel = R.pipe(
  R.nthArg(0),
  R.path(['action', 'type']),
  R.flip(R.contains)([
    ActionTypes.TIMETRAVEL_HISTORY,
    ActionTypes.TIMETRAVEL_REVERT,
    ActionTypes.TIMETRAVEL_DECLUTCH,
    ActionTypes.TIMETRAVEL_CLUTCH
  ]),
  R.not
);

const rejectDeclutch = R.ifElse(
  // if was declutched and not time travelling.
  R.allPass([R.nthArg(1), isNotTimeTravel]),
  // abort the reduce.
  R.always(null),
  // otherwise continue reducing.
  R.nthArg(0)
);

const getDeclutchStream = (preStream) => (
  Bacon.mergeAll(
    preStream
      .filter(isClutch)
      .map(R.always(false)),

    preStream
      .filter(isDeclutch)
      .map(R.always(true))
  )
);

export const getPreReduce = () => {
  let preStream = new Bacon.Bus();
  let declutchStream = new Bacon.Bus();
  let declutchProperty = declutchStream.toProperty(
    // declutch by default when resuming from session storage.
    !!Storage.load('bduxHistory'));

  declutchStream.plug(
    // whether currently clutched to dispatcher.
    getDeclutchStream(preStream)
  );

  // start recording.
  TimeTravelAction.start();
  // resume from session storage.
  TimeTravelAction.resume();

  return {
    input: preStream,
    output: Bacon.when(
        // filter out actions while declutched.
        [preStream, declutchProperty], rejectDeclutch)
      .filter(R.identity)
      // record the action and store states.
      .doAction(TimeTravelAction.record)
      // handle revert action.
      .map(mapTimeRevert)
  };
};
