import * as R from 'ramda'
import styles from './button-style.android'

export default R.mergeWith(R.merge, styles, {
  text: {
    fontFamily: 'Helvetica Neue'
  }
})
