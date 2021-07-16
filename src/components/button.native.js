import * as R from 'ramda'
import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import styles from './button-style'

const mergeTextStyle = R.pipe(
  R.defaultTo({}),
  R.pick(['color']),
  R.merge(styles.text)
)

export const Button = (props) => {
  const { style, children, onClick } = props
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={styles.wrap}>
        <Text style={mergeTextStyle(style)}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(Button)
