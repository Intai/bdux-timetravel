import R from 'ramda';

const PREFIX = 'TT';

const mapToKeyValue = (obj, key) => {
  obj[key] = PREFIX + '_' + key;
  return obj
};

export default {

  canUseDOM: R.once(() => (
    typeof window !== 'undefined'
      && window.document
      && window.document.createElement
  )),

  now: Date.now || (() => (
    (new Date()).getTime()
  )),

  // map an array of strings to
  // object keys and prefixed values.
  createObjOfConsts: R.reduce(
    mapToKeyValue, {}
  )
};
