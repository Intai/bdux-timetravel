import * as R from 'ramda'
import { useRef, useMemo } from 'react'

const getAnchorIndex = ({ list, anchor }) => ({
  list,
  anchor,
  anchorIndex: (anchor && anchor.getIndex)
    ? anchor.getIndex()
    : -1
})

const hasListAnchor = ({ list, anchorIndex }) => (
  list && anchorIndex >= 0
)

const isDiffAnchorId = (() => {
  let prev = 0
  return ({ anchor }) => {
    const id = anchor.getId()
    if (prev !== id) {
      prev = id
      return true
    }
    return false
  }
})()

const scrollToIndex = ({ list, anchorIndex }) => {
  list.scrollToIndex({
    index: anchorIndex,
    viewOffset: 0,
    viewPosition: 0,
    animated: false
  })
}

const scrollToDiffAnchor = R.when(
  isDiffAnchorId,
  scrollToIndex,
)

const scrollToAnchor = R.pipe(
  getAnchorIndex,
  R.when(
    hasListAnchor,
    scrollToDiffAnchor
  )
)

export const useScrollIntoView = () => {
  const refList = useRef()
  const refAnchor = useRef()

  return useMemo(() => ({
    refList,
    refAnchor,
    handleUpdate: () => {
      scrollToAnchor({
        list: refList.current,
        anchor: refAnchor.current,
      })
    }
  }), [])
}
