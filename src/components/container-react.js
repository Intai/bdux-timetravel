import React from 'react'
import { createComponent } from 'bdux'

export const Container = (props) => (
  <div { ...props }/>
)

export default createComponent(Container)
