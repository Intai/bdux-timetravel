import R from 'ramda';

const mapToKeyValue = (obj, key) => {
  obj[key] = key;
  return obj
};

const mapToKeys = R.reduce(
  mapToKeyValue, {}
);

export default mapToKeys([
  'TIMETRAVEL_HISTORY',
  'TIMETRAVEL_REVERT',
  'TIMETRAVEL_DECLUTCH',
  'TIMETRAVEL_CLUTCH'
]);
