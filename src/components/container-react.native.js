import React from 'react'
import { View } from 'react-native'
import { createComponent } from 'bdux'

export const Container = (props) => (
  <View { ...props } />
)

export default createComponent(Container)
