/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as R from 'ramda'
import React from 'react'
import ReactNative from 'react-native'
import { shallow } from 'enzyme'
import { scrollIntoView } from './scroll-into-view-react.native'

const shallowScrollIntoView = R.compose(
  shallow,
  React.createElement,
  scrollIntoView
)

const renderScrollIntoView = (wrap, list, anchor) => {
  const wrapper = shallowScrollIntoView(
    ({ refWrap, refList, refAnchor }) => {
      refWrap(wrap)
      refList(list)
      refAnchor(anchor)
      return false
    }
  )

  wrapper.shallow()
  return wrapper
}

const createElements = (args) => ({
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
})

const defer = (done, callback) => {
  setTimeout(() => {
    callback()
    done()
  }, 0)
}

describe('ScrollIntoView Decorator for react-native', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  it('should create a react component', () => {
    const Test = scrollIntoView(R.F)
    chai.expect(React.Component.isPrototypeOf(Test)).to.be.true
  })

  it('should keep the component name', () => {
    const Test = scrollIntoView(class Test extends React.Component {})
    chai.expect(Test.displayName).to.equal('Test')
  })

  it('should set the default component name', () => {
    const Test = scrollIntoView(R.F)
    chai.expect(Test.displayName).to.equal('Component')
  })

  it('should keep the component name from displayName', () => {
    const Test = scrollIntoView(scrollIntoView(class Test extends React.Component {}))
    chai.expect(Test.displayName).to.equal('Test')
  })

  it('should have no default props', () => {
    const Test = scrollIntoView(R.F)
    chai.expect(Test.defaultProps).to.eql({})
  })

  it('should have no default state', () => {
    const Test = scrollIntoView()
    const wrapper = shallow(<Test />)
    chai.expect(wrapper.state()).to.eql({})
  })

  it('should reference list and anchor', () => {
    const wrap = {}
    const list = {}
    const anchor = {}
    const wrapper = renderScrollIntoView(wrap, list, anchor)
    chai.expect(wrapper.instance()).to.include({
      wrap,
      list,
      anchor
    })
  })

  it('should scroll on layout', (done) => {
    const { wrap, list, anchor } = createElements({
      wrapHeight: 10,
      listOffset: 10,
      listHeight: 20,
      anchorY: 0,
      anchorHeight: 5
    })

    const wrapper = renderScrollIntoView(wrap, list, anchor)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.calledOnce).to.be.true
      chai.expect(list.scrollTo.lastCall.args[0]).to.eql({
        x: 0,
        y: 0,
        animated: false
      })
    })
  })

  it('should not scroll to the same anchor', (done) => {
    const { wrap, list, anchor } = createElements({
      wrapHeight: 10,
      listOffset: 10,
      listHeight: 20,
      anchorY: 0,
      anchorHeight: 5
    })

    const wrapper = renderScrollIntoView(wrap, list, anchor)
    wrapper.simulate('layout')
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.calledOnce).to.be.true
    })
  })

  it('should not scroll when there is no list', (done) => {
    const { wrap, list, anchor } = createElements({})
    const wrapper = renderScrollIntoView(wrap, undefined, anchor)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.called).to.be.false
    })
  })

  it('should not scroll when there is no anchor', (done) => {
    const { wrap, list } = createElements({})
    const wrapper = renderScrollIntoView(wrap, list, undefined)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.called).to.be.false
    })
  })

  it('should not scroll when list has zero height', (done) => {
    const { wrap, list, anchor } = createElements({
      listHeight: 0
    })

    const wrapper = renderScrollIntoView(wrap, list, anchor)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.called).to.be.false
    })
  })

  it('should scroll to anchor below the bottom', (done) => {
    const { wrap, list, anchor } = createElements({
      wrapHeight: 10,
      listOffset: 0,
      listHeight: 10,
      anchorY: 9,
      anchorHeight: 5
    })

    const wrapper = renderScrollIntoView(wrap, list, anchor)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.calledOnce).to.be.true
      chai.expect(list.scrollTo.lastCall.args[0]).to.have.property('y', 4)
    })
  })

  it('should scroll to large anchor below the bottom', (done) => {
    const { wrap, list, anchor } = createElements({
      wrapHeight: 10,
      listOffset: 0,
      listHeight: 10,
      anchorY: 9,
      anchorHeight: 20
    })

    const wrapper = renderScrollIntoView(wrap, list, anchor)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.calledOnce).to.be.true
      chai.expect(list.scrollTo.lastCall.args[0]).to.have.property('y', 9)
    })
  })

  it('should scroll to align at the bottom', (done) => {
    const { wrap, list, anchor } = createElements({
      wrapHeight: 10,
      listOffset: 0,
      listHeight: 12,
      anchorY: 5,
      anchorHeight: 5
    })

    const wrapper = renderScrollIntoView(wrap, list, anchor)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.calledOnce).to.be.true
      chai.expect(list.scrollTo.lastCall.args[0]).to.have.property('y', 2)
    })
  })

  it('should not scroll for anchor already in view', (done) => {
    const { wrap, list, anchor } = createElements({
      wrapHeight: 10,
      listOffset: 0,
      listHeight: 20,
      anchorY: 5,
      anchorHeight: 5
    })

    const wrapper = renderScrollIntoView(wrap, list, anchor)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(list.scrollTo.called).to.be.false
    })
  })

  it('should not find node handle', (done) => {
    const { wrap, list, anchor } = createElements({
      wrapHeight: 20
    })

    sandbox.spy(anchor, 'measureLayout')
    sandbox.stub(ReactNative, 'findNodeHandle').value(undefined)

    const wrapper = renderScrollIntoView(wrap, list, anchor)
    wrapper.simulate('layout')
    defer(done, () => {
      chai.expect(anchor.measureLayout.calledOnce).to.be.true
      chai.expect(anchor.measureLayout.lastCall.args[0]).to.be.false
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

})
