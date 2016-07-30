import R from 'ramda'
import React from 'react'

const getDisplayName = (Component) => (
  Component.displayName || Component.name || 'Component'
)

export const calcScrollTop = ({ scrollTop, listHeight, anchorTop, anchorHeight }) => {
  // over the top.
  if (anchorTop < scrollTop) {
    return anchorTop
  }
  else {
    let offset = anchorTop - listHeight + anchorHeight

    // below the bottom.
    if (offset > scrollTop) {
      // too big to fit into the view.
      if (anchorHeight > listHeight) {
        return anchorTop
      }

      return offset
    }
    // already in view.
    else {
      return -1
    }
  }
}

const bindMouseEvents = R.once((node, setHover) => {
  node.addEventListener('mouseenter', () => setHover(true))
  node.addEventListener('mouseleave', () => setHover(false))
})

const isNotHover = (() => {
  let isHover = false
  return ({ list }) => {
    bindMouseEvents(list, (value) => isHover = value)
    return !isHover
  }
})()

const hasListAnchor = R.allPass([
  R.prop('list'),
  R.prop('anchor')
])

const isListVisible = ({ list }) => (
  list && list instanceof Element
    && list.tagName !== 'NOSCRIPT'
    && list.offsetHeight
)

const scrollTo = ({ list, scrollTop }) => {
  if (scrollTop >= 0) {
    list.scrollTop = scrollTop
  }
}

const getScrollTop = ({ list, anchor }) => ({
  list: list,
  scrollTop: calcScrollTop({
    scrollTop: list.scrollTop,
    listHeight: list.offsetHeight,
    anchorTop: anchor.offsetTop,
    anchorHeight: anchor.offsetHeight
  })
})

const isDiffAnchor = (() => {
  let prev = 0

  return ({ anchor }) => (
    (prev !== anchor)
      ? prev = anchor
      : false
  )
})()

const scrollToDiffAnchor = R.when(
  isDiffAnchor,
  R.pipe(
    getScrollTop,
    scrollTo
  )
)

const scrollToAnchor = R.when(
  R.allPass([hasListAnchor, isListVisible, isNotHover]),
  scrollToDiffAnchor
)

export const scrollIntoView = (Component) => (
  React.createClass({
    displayName: getDisplayName(Component),
    getDefaultProps: () => ({}),
    getInitialState: () => ({}),

    componentDidUpdate() {
      scrollToAnchor({
        list: this.list,
        anchor: this.anchor
      })
    },

    render() {
      return React.createElement(
        Component, Object.assign({}, this.props, {
          refList: node => this.list = node,
          refAnchor: node => this.anchor = node
        })
      )
    }
  })
)
