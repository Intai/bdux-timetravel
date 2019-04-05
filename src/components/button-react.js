import * as R from 'ramda'
import React from 'react'
import styles from './button-style'
import { useBdux } from 'bdux'

const mergeButtonStyle = R.pipe(
  R.defaultTo({}),
  R.pick(['color', 'marginTop']),
  R.merge(styles.button)
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
