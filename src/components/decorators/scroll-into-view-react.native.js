import R from 'ramda'
import React from 'react'
import ReactNative from 'react-native'
import { calcScrollTop }  from './scroll-into-view-react.js'

const getDisplayName = (Component) => (
  Component.displayName || Component.name || 'Component'
)

const hasListAnchor = R.allPass([
  R.prop('list'),
  R.prop('anchor')
])

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

const findNodeHandle = (
  ReactNative.findNodeHandle || R.F
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
    R.allPass([hasListHeight, isDiffAnchor]),
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

export const scrollIntoView = (Component = R.F) => (
  class extends React.Component {
    static displayName = getDisplayName(Component)
    static defaultProps = {}
    state = {}

    /* istanbul ignore next */
    constructor() {
      super()
    }

    onLayout() {
      scrollToAnchor({
        wrap: this.wrap,
        list: this.list,
        anchor: this.anchor
      })
    }

    render() {
      return React.createElement(
        Component, R.merge(this.props, {
          refWrap: node => this.wrap = node,
          refList: node => this.list = node,
          refAnchor: node => this.anchor = node,
          onLayout: R.bind(this.onLayout, this)
        })
      )
    }
  }
)
