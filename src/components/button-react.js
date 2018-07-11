import * as R from 'ramda'
import React from 'react'
import Common from '../utils/common-util'
import styles from './button-style'
import { createComponent } from 'bdux'

const mergeButtonStyle = R.pipe(
  R.defaultTo({}),
  R.pick(['color', 'marginTop']),
  R.merge(styles.button)
)

export const Button = ({ style, ...props }) => (
  <button
    { ...Common.removeReserved(props) }
    style={ mergeButtonStyle(style) }
  />
)

export default createComponent(Button)
