import R from 'ramda';
import Common from './common-util';

const whenCanUseDOM = R.flip(R.wrap)((func, ...args) => (
  Common.canUseDOM()
    && func.apply(func, args)
));

export default {

  save: R.curryN(2, whenCanUseDOM((name, value) => (
    window.sessionStorage
      .setItem(name, JSON.stringify(value))
  ))),

  load: whenCanUseDOM((name) => {
    try {
      return JSON.parse(window.sessionStorage
        .getItem(name));
    }
    catch (e) {}
  }),

  remove: whenCanUseDOM((name) => (
    window.sessionStorage
      .removeItem(name)
  ))
};
