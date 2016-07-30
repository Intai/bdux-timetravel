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

const getAnchorDimension = ({ list, anchor, listHeight }) => (
  new Promise((resolve) => {
    anchor.measureLayout(
      ReactNative.findNodeHandle(list),
      (x, y, width, height) => {
        resolve({
          list,
          listHeight,
          anchorTop: y,
          anchorHeight: height,
          scrollTop: list.scrollProperties.offset
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

  return ({ anchor, listHeight }) => (
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

const defer = (func) => (...args) => {
  setTimeout(
    R.partial(func, args), 0)
}

const scrollToAnchor = R.when(
  hasListAnchor,
  defer(scrollToDiffAnchor)
)

export const scrollIntoView = (Component) => (
  React.createClass({
    displayName: getDisplayName(Component),
    getDefaultProps: () => ({}),
    getInitialState: () => ({}),

    componentDidUpdate() {
      scrollToAnchor({
        wrap: this.wrap,
        list: this.list,
        anchor: this.anchor
      })
    },

    render() {
      return React.createElement(
        Component, Object.assign({}, this.props, {
          refWrap: node => this.wrap = node,
          refList: node => this.list = node,
          refAnchor: node => this.anchor = node
        })
      )
    }
  })
)
