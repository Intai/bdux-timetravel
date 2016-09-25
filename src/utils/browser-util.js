import R from 'ramda'
import Common from './common-util'

export const reload = () => {
  document.location.reload()
}

export default {

  reload: R.when(
    Common.canUseDOM,
    reload
  )
};
