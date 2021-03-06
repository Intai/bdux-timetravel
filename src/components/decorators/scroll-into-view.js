import * as R from 'ramda'
import React, { useEffect, useMemo } from 'react'

const isAnchorOverTop = ({ scrollTop, anchorTop }) => (
  anchorTop < scrollTop
)

const isAnchorBelowBottom = ({ scrollTop, listHeight, anchorTop, anchorHeight }) => (
  anchorTop + anchorHeight > scrollTop + listHeight
)

const isScrollBelowBottom = ({ scrollHeight, listHeight, anchorTop }) => (
  anchorTop + listHeight > scrollHeight
)

const calcAnchorBottom = ({ listHeight, anchorTop, anchorHeight }) => (
  (anchorHeight > listHeight)
    // too big to fit into the view.
    ? anchorTop
    // anchor at the bottom.
    : (anchorTop + anchorHeight - listHeight)
)

const calcScrollBottom = ({ scrollHeight, listHeight }) => (
  Math.max(0, scrollHeight - listHeight)
)

export const calcScrollTop = R.cond([
  [isAnchorOverTop, R.prop('anchorTop')],
  [isAnchorBelowBottom, calcAnchorBottom],
  [isScrollBelowBottom, calcScrollBottom],
  [R.T, R.always(-1)]
])

const memoizeNode = (func) => {
  const nodes = []
  return (...args) => {
    const node = args[0];
    if (nodes.indexOf(node) < 0) {
      nodes.push(node)
      R.apply(func, args)
    }
  }
}

const bindMouseEvents = memoizeNode((node, setHover) => {
  node.addEventListener('mouseenter', () => setHover(true))
  node.addEventListener('mouseleave', () => setHover(false))
})

const isNotHover = (() => {
  let isHover = false
  return ({ list }) => {
    bindMouseEvents(list, value => isHover = value)
    return !isHover
  }
})()

const hasListAnchor = R.both(
  R.prop('list'),
  R.prop('anchor')
)

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
    scrollHeight: list.scrollHeight,
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

export const useScrollIntoView = () => {
  const refs = useMemo(() => ({
    refList: React.createRef(),
    refAnchor: React.createRef(),
  }), [])

  useEffect(() => {
    scrollToAnchor({
      list: refs.refList.current,
      anchor: refs.refAnchor.current
    })
  })

  return refs
}
