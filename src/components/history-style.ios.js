import * as R from 'ramda'
import styles from './history-style.android'

export default R.mergeWith(R.mergeRight, styles, {
  actionType: {
    fontFamily: 'Helvetica Neue'
  },
  actionValue: {
    fontFamily: 'Helvetica Neue'
  }
})
