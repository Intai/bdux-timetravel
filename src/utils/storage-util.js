import R from 'ramda';

export default {

  save: R.curry((name, value) => (
    window.sessionStorage
      .setItem(name, JSON.stringify(value))
  )),

  load: (name) => (
    JSON.parse(window.sessionStorage
      .getItem(name))
  ),

  remove: (name) => (
    window.sessionStorage
      .removeItem(name)
  )
};
