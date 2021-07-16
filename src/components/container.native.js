import React from 'react'
import { View } from 'react-native'

export const Container = (props) => (
  <View { ...props } />
)

export default React.memo(Container)
