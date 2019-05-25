import * as R from 'ramda'
import React, { useMemo } from 'react'
import ReactNative from 'react-native'
import { calcScrollTop }  from './scroll-into-view-react.js'

const hasListAnchor = R.both(
  R.prop('list'),
  R.prop('anchor')
)

const scrollTo = (list, scrollTop) => {
  if (scrollTop >= 0) {
    list.scrollTo({
      x: 0,
      y: scrollTop,
      animated: false
    })
  }
}

const getListHeight = ({ wrap, list, anchor }) => (
  new Promise((resolve) => {
    wrap.measure(
      (x, y, width, height) => {
        resolve({
          list,
          anchor,
          listHeight: height
        })
      }
    )
  })
)

const findNodeHandle = (...args) => (
  (ReactNative.findNodeHandle)
    ? ReactNative.findNodeHandle(...args)
    : false
)

const getAnchorDimension = ({ list, anchor, listHeight }) => (
  new Promise((resolve) => {
    anchor.measureLayout(
      findNodeHandle(list),
      (x, y, width, height) => {
        resolve({
          list,
          listHeight,
          anchorTop: y,
          anchorHeight: height,
          scrollTop: list.scrollProperties.offset,
          scrollHeight: list.scrollProperties.contentLength
        })
      }
    )
  })
)

const hasListHeight = R.propSatisfies(
  R.lt(0), 'listHeight'
)

const isDiffAnchor = (() => {
  let prev = 0

  return ({ anchor }) => (
    (prev !== anchor)
      ? prev = anchor
      : false
  )
})()

const scrollListTo = R.converge(
  scrollTo, [
    R.prop('list'),
    calcScrollTop
  ]
)

const scrollToDiffAnchor = R.pipeP(
  getListHeight,
  R.when(
    R.both(hasListHeight, isDiffAnchor),
    R.pipeP(
      getAnchorDimension,
      scrollListTo
    )
  )
)

const scrollToAnchor = R.when(
  hasListAnchor,
  scrollToDiffAnchor
)

export const useScrollIntoView = () => {
  return useMemo(() => {
    const refWrap = React.createRef()
    const refList = React.createRef()
    const refAnchor = React.createRef()

    return {
      refWrap,
      refList,
      refAnchor,
      handleLayout: () => {
        scrollToAnchor({
          wrap: refWrap.current,
          list: refList.current,
          anchor: refAnchor.current,
        })
      },
    }
  }, [])
}
