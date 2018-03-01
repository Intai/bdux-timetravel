/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as R from 'ramda'
import React from 'react'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { scrollIntoView } from './scroll-into-view-react'

const shallowScrollIntoView = R.compose(
  shallow,
  React.createElement,
  scrollIntoView
)

const renderScrollIntoView = (list, anchor) => {
  const wrapper = shallowScrollIntoView(
    ({ refList, refAnchor }) => {
      refList(list)
      refAnchor(anchor)
      return false
    }
  )

  wrapper.shallow()
  return wrapper
}

const mountScrollIntoView = R.compose(
  mount,
  React.createElement,
  scrollIntoView
)

const getAnchor = R.ifElse(
  R.is(Function),
  R.call,
  R.identity
)

const renderDomScrollIntoView = (list, anchor) => (
  mountScrollIntoView(
    ({ refList, refAnchor }) => {
      refList(list)
      refAnchor(getAnchor(anchor))
      return false
    }
  )
)

describe('ScrollIntoView Decorator', () => {

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
    const list = {}
    const anchor = {}
    const wrapper = renderScrollIntoView(list, anchor)
    chai.expect(wrapper.instance()).to.include({
      list,
      anchor
    })
  })

  describe('with jsdom', () => {

    let list, anchor, scrollTo

    beforeEach(() => {
      const dom = new JSDOM('<html></html>')
      global.window = dom.window
      global.document = dom.window.document
      global.Element = dom.window.Element
    })

    beforeEach(() => {
      list = document.createElement('ul')
      anchor = document.createElement('li')
      scrollTo = sinon.stub()

      Object.defineProperties(list, {
        scrollTop: { set: scrollTo, configurable: true }
      })
    })

    it('should scroll on update', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(10) },
        offsetHeight: { value: 10 }
      })

      Object.defineProperties(anchor, {
        offsetTop: { value: 0 }
      })

      const wrapper = renderDomScrollIntoView(list, anchor)
      wrapper.setProps({})
      chai.expect(scrollTo.calledOnce).to.be.true
      chai.expect(scrollTo.lastCall.args[0]).to.equal(0)
    })

    it('should not scroll to the same anchor', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(10) },
        offsetHeight: { value: 10 }
      })

      Object.defineProperties(anchor, {
        offsetTop: { value: 0 }
      })

      const wrapper = renderDomScrollIntoView(list, anchor)
      wrapper.setProps({})
      wrapper.setProps({})
      chai.expect(scrollTo.calledOnce).to.be.true
    })

    it('should not scroll when there is no list', () => {
      const wrapper = renderDomScrollIntoView(undefined, anchor)
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

    it('should not scroll when there is no anchor', () => {
      const wrapper = renderDomScrollIntoView(list, undefined)
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

    it('should not scroll when list has zero height', () => {
      Object.defineProperties(list, {
        offsetHeight: { value: 0 }
      })

      const wrapper = renderDomScrollIntoView(list, anchor)
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

    it('should not scroll when mouse over', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(10) },
        offsetHeight: { value: 10 }
      })

      const wrapper = renderDomScrollIntoView(list, () => anchor)
      wrapper.setProps({})
      scrollTo.reset()

      list.dispatchEvent(new window.CustomEvent('mouseenter'));
      anchor = { offsetTop: 0 }
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

    it('should scroll after mouse leave', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(10) },
        offsetHeight: { value: 10 }
      })

      const wrapper = renderDomScrollIntoView(list, () => anchor)
      wrapper.setProps({})
      scrollTo.reset()

      list.dispatchEvent(new window.CustomEvent('mouseenter'));
      list.dispatchEvent(new window.CustomEvent('mouseleave'));
      anchor = { offsetTop: 5 }
      wrapper.setProps({})
      chai.expect(scrollTo.calledOnce).to.be.true
      chai.expect(scrollTo.lastCall.args[0]).to.equal(5)
    })

    it('should scroll to anchor below the bottom', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(0) },
        offsetHeight: { value: 10 }
      })

      Object.defineProperties(anchor, {
        offsetTop: { value: 9 },
        offsetHeight: { value: 5 }
      })

      const wrapper = renderDomScrollIntoView(list, anchor)
      wrapper.setProps({})
      chai.expect(scrollTo.calledOnce).to.be.true
      chai.expect(scrollTo.lastCall.args[0]).to.equal(4)
    })

    it('should scroll to large anchor below the bottom', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(0) },
        offsetHeight: { value: 10 }
      })

      Object.defineProperties(anchor, {
        offsetTop: { value: 9 },
        offsetHeight: { value: 20 }
      })

      const wrapper = renderDomScrollIntoView(list, anchor)
      wrapper.setProps({})
      chai.expect(scrollTo.calledOnce).to.be.true
      chai.expect(scrollTo.lastCall.args[0]).to.equal(9)
    })

    it('should scroll to align at the bottom', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(0) },
        offsetHeight: { value: 10 },
        scrollHeight: { value: 12 }
      })

      Object.defineProperties(anchor, {
        offsetTop: { value: 5 },
        offsetHeight: { value: 5 }
      })

      const wrapper = renderDomScrollIntoView(list, anchor)
      wrapper.setProps({})
      chai.expect(scrollTo.calledOnce).to.be.true
      chai.expect(scrollTo.lastCall.args[0]).to.equal(2)
    })

    it('should not scroll for anchor already in view', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(0) },
        offsetHeight: { value: 10 },
        scrollHeight: { value: 20 }
      })

      Object.defineProperties(anchor, {
        offsetTop: { value: 5 },
        offsetHeight: { value: 5 }
      })

      const wrapper = renderDomScrollIntoView(list, anchor)
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

  })

})
