import React from 'react'
import { View } from 'react-native'
import { useBdux } from 'bdux'

export const Container = (props) => {
  useBdux(props)
  return <View { ...props } />
}

export default React.memo(Container)
