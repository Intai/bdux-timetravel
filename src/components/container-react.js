import React from 'react'
import Common from '../utils/common-util'
import { createComponent } from 'bdux'

export const Container = (props) => (
  <div { ...Common.removeReserved(props) } />
)

export default createComponent(Container)
