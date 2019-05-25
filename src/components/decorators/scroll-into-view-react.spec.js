/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as R from 'ramda'
import React from 'react'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { useScrollIntoView } from './scroll-into-view-react'

describe('useScrollIntoView Hook', () => {

  it('should reference list and anchor', () => {
    const Test = () => {
      const { refList, refAnchor } = useScrollIntoView()
      chai.expect(refList).to.have.property('current')
      chai.expect(refAnchor).to.have.property('current')
      return false
    }
    shallow(<Test />)
  })

  describe('with jsdom', () => {

    let list, anchor, scrollTo, Test

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

      Test = (props) => {
        const { refList, refAnchor } = useScrollIntoView()
        refList.current = 'list' in props ? props.list : list
        refAnchor.current = 'anchor' in props ? props.anchor : anchor
        return false
      }
    })

    it('should scroll on update', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(10) },
        offsetHeight: { value: 10 }
      })
      Object.defineProperties(anchor, {
        offsetTop: { value: 0 }
      })

      const wrapper = mount(<Test />)
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

      const wrapper = mount(<Test />)
      wrapper.setProps({})
      wrapper.setProps({})
      chai.expect(scrollTo.calledOnce).to.be.true
    })

    it('should not scroll when there is no list', () => {
      const wrapper = mount(<Test list={undefined} />)
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

    it('should not scroll when there is no anchor', () => {
      const wrapper = mount(<Test anchor={undefined} />)
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

    it('should not scroll when list has zero height', () => {
      Object.defineProperties(list, {
        offsetHeight: { value: 0 }
      })

      const wrapper = mount(<Test />)
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

    it('should not scroll when mouse over', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(10) },
        offsetHeight: { value: 10 }
      })

      const wrapper = mount(<Test />)
      wrapper.setProps({})
      scrollTo.reset()

      list.dispatchEvent(new window.CustomEvent('mouseenter'));
      anchor = { offsetTop: 0 }
      wrapper.setProps({ anchor })
      chai.expect(scrollTo.called).to.be.false
    })

    it('should scroll after mouse leave', () => {
      Object.defineProperties(list, {
        scrollTop: { get: R.always(10) },
        offsetHeight: { value: 10 }
      })

      const wrapper = mount(<Test />)
      wrapper.setProps({})
      scrollTo.reset()

      list.dispatchEvent(new window.CustomEvent('mouseenter'));
      list.dispatchEvent(new window.CustomEvent('mouseleave'));
      anchor = { offsetTop: 5 }
      wrapper.setProps({ anchor })
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

      const wrapper = mount(<Test />)
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

      const wrapper = mount(<Test />)
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

      const wrapper = mount(<Test />)
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

      const wrapper = mount(<Test />)
      wrapper.setProps({})
      chai.expect(scrollTo.called).to.be.false
    })

  })

})
