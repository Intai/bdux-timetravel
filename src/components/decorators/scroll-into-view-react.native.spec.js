/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import ReactNative from 'react-native'
import { shallow } from 'enzyme'
import { useScrollIntoView } from './scroll-into-view-react.native'

const createElements = (args) => {
  const elms = {
    wrap: {
      measure: (func) => {
        func(0, 0, 0, args.wrapHeight)
      }
    },

    list: {
      scrollTo: sinon.stub(),
      scrollProperties: {
        offset: args.listOffset,
        contentLength: args.listHeight
      }
    },

    anchor: {
      measureLayout: (node, func) => {
        func(0, args.anchorY, 0, args.anchorHeight)
      }
    }
  }
  if (args.refWrap) args.refWrap.current = elms.wrap
  if (args.refList) args.refList.current = elms.list
  if (args.refAnchor) args.refAnchor.current = elms.anchor
  return elms
}

const defer = (done, callback) => {
  setTimeout(() => {
    callback()
    done()
  }, 0)
}

describe('useScrollIntoView Hook for react-native', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  it('should reference wrap, list and anchor', () => {
    const Test = () => {
      const { refWrap, refList, refAnchor } = useScrollIntoView()
      chai.expect(refWrap).to.have.property('current')
      chai.expect(refList).to.have.property('current')
      chai.expect(refAnchor).to.have.property('current')
      return false
    }
    shallow(<Test />)
  })

  it('should scroll on layout', (done) => {
    const Test = () => {
      const { refWrap, refList, refAnchor, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refList,
        refAnchor,
        wrapHeight: 10,
        listOffset: 10,
        listHeight: 20,
        anchorY: 0,
        anchorHeight: 5,
      })
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(1)
        chai.expect(list.scrollTo.lastCall.args[0]).to.eql({
          x: 0,
          y: 0,
          animated: false
        })
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll to the same anchor', (done) => {
    const Test = () => {
      const { refWrap, refList, refAnchor, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refList,
        refAnchor,
        wrapHeight: 10,
        listOffset: 10,
        listHeight: 20,
        anchorY: 0,
        anchorHeight: 5,
      })
      handleLayout()
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(1)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll when there is no list', (done) => {
    const Test = () => {
      const { refWrap, refAnchor, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refAnchor,
      })
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(0)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll when there is no anchor', (done) => {
    const Test = () => {
      const { refWrap, refList, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refList,
      })
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(0)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll when list has zero height', (done) => {
    const Test = () => {
      const { refWrap, refList, refAnchor, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refList,
        refAnchor,
        listHeight: 0,
      })
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(0)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should scroll to anchor below the bottom', (done) => {
    const Test = () => {
      const { refWrap, refList, refAnchor, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refList,
        refAnchor,
        wrapHeight: 10,
        listOffset: 0,
        listHeight: 10,
        anchorY: 9,
        anchorHeight: 5,
      })
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(1)
        chai.expect(list.scrollTo.lastCall.args[0]).to.have.property('y', 4)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should scroll to large anchor below the bottom', (done) => {
    const Test = () => {
      const { refWrap, refList, refAnchor, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refList,
        refAnchor,
        wrapHeight: 10,
        listOffset: 0,
        listHeight: 10,
        anchorY: 9,
        anchorHeight: 20,
      })
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(1)
        chai.expect(list.scrollTo.lastCall.args[0]).to.have.property('y', 9)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should scroll to align at the bottom', (done) => {
    const Test = () => {
      const { refWrap, refList, refAnchor, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refList,
        refAnchor,
        wrapHeight: 10,
        listOffset: 0,
        listHeight: 12,
        anchorY: 5,
        anchorHeight: 5,
      })
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(1)
        chai.expect(list.scrollTo.lastCall.args[0]).to.have.property('y', 2)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll for anchor already in view', (done) => {
    const Test = () => {
      const { refWrap, refList, refAnchor, handleLayout } = useScrollIntoView()
      const { list } = createElements({
        refWrap,
        refList,
        refAnchor,
        wrapHeight: 10,
        listOffset: 0,
        listHeight: 20,
        anchorY: 5,
        anchorHeight: 5,
      })
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(0)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not find node handle', (done) => {
    const Test = () => {
      const { refWrap, refList, refAnchor, handleLayout } = useScrollIntoView()
      const { list, anchor } = createElements({
        refWrap,
        refList,
        refAnchor,
        wrapHeight: 20,
      })
      sandbox.spy(anchor, 'measureLayout')
      sandbox.stub(ReactNative, 'findNodeHandle').value(undefined)
      handleLayout()
      defer(done, () => {
        chai.expect(list.scrollTo.callCount).to.equal(0)
        chai.expect(anchor.measureLayout.lastCall.args[0]).to.be.false
      })
      return false
    }
    shallow(<Test />)
  })

  afterEach(() => {
    sandbox.restore()
  })

})
