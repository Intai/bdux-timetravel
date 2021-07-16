import React from 'react'
import { useBdux } from 'bdux'

export const Container = (props) => {
  useBdux(props)
  return <div {...props} />
}

export default React.memo(Container)
