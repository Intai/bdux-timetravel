import R from 'ramda'
import React from 'react'
import styles from './button-style'
import { createComponent } from 'bdux'

const mergeButtonStyle = R.pipe(
  R.defaultTo({}),
  R.pick(['color', 'marginTop']),
  R.merge(styles.button)
)

export const Button = ({ style, children, ...props }) => (
  <button { ...props }
    style={ mergeButtonStyle(style) }>
    { children }
  </button>
)

export default createComponent(Button)
