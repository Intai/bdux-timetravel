/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { shallow } from 'enzyme'
import { useScrollIntoView } from './scroll-into-view-react.native'

const createElements = (args) => {
  const elms = {
    list: {
      scrollToIndex: sinon.stub(),
    },

    anchor: {
      getIndex: () => args.anchorIndex,
      getId: () => args.anchorId,
    }
  }
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
      const { refList, refAnchor } = useScrollIntoView()
      chai.expect(refList).to.have.property('current')
      chai.expect(refAnchor).to.have.property('current')
      return false
    }
    shallow(<Test />)
  })

  it('should scroll on layout', (done) => {
    const Test = () => {
      const { refList, refAnchor, handleUpdate } = useScrollIntoView()
      const { list } = createElements({
        refList,
        refAnchor,
        anchorIndex: 0,
        anchorId: 1,
      })
      handleUpdate()
      defer(done, () => {
        chai.expect(list.scrollToIndex.callCount).to.equal(1)
        chai.expect(list.scrollToIndex.lastCall.args[0]).to.eql({
          index: 0,
          viewOffset: 0,
          viewPosition: 0,
          animated: false
        })
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll to the same anchor', (done) => {
    const Test = () => {
      const { refList, refAnchor, handleUpdate } = useScrollIntoView()
      const { list } = createElements({
        refList,
        refAnchor,
        anchorIndex: 1,
        anchorId: 2,
      })
      handleUpdate()
      handleUpdate()
      defer(done, () => {
        chai.expect(list.scrollToIndex.callCount).to.equal(1)
        chai.expect(list.scrollToIndex.lastCall.args[0]).to.eql({
          index: 1,
          viewOffset: 0,
          viewPosition: 0,
          animated: false
        })
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll when there is no list', (done) => {
    const Test = () => {
      const { refAnchor, handleUpdate } = useScrollIntoView()
      const { list } = createElements({
        refAnchor,
      })
      handleUpdate()
      defer(done, () => {
        chai.expect(list.scrollToIndex.callCount).to.equal(0)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll when there is no anchor', (done) => {
    const Test = () => {
      const { refList, handleUpdate } = useScrollIntoView()
      const { list } = createElements({
        refList,
      })
      handleUpdate()
      defer(done, () => {
        chai.expect(list.scrollToIndex.callCount).to.equal(0)
      })
      return false
    }
    shallow(<Test />)
  })

  it('should not scroll when anchor has negative index', (done) => {
    const Test = () => {
      const { refList, refAnchor, handleUpdate } = useScrollIntoView()
      const { list } = createElements({
        refList,
        refAnchor,
        anchorIndex: -1,
      })
      handleUpdate()
      defer(done, () => {
        chai.expect(list.scrollToIndex.callCount).to.equal(0)
      })
      return false
    }
    shallow(<Test />)
  })

  afterEach(() => {
    sandbox.restore()
  })

})
