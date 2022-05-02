import * as R from 'ramda'
import React from 'react'
import { useBdux } from 'bdux'
import styles from './button-style'

const mergeButtonStyle = R.pipe(
  R.defaultTo({}),
  R.pick(['color', 'marginTop']),
  R.mergeRight(styles.button)
)

export const Button = (props) => {
  useBdux(props)
  return (
    <button
      {...props}
      style={mergeButtonStyle(props.style)}
    />
  )
}

export default React.memo(Button)
