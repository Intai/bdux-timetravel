/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import * as Bacon from 'baconjs'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import TimeTravelStore from '../stores/timetravel-store'
import { History } from './history'
import styles from './history-style'

describe('History Component', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  it('should render nothing by default', () => {
    const wrapper = shallow(<History />)
    chai.expect(wrapper.type()).to.be.null
  })

  it('should render an empty history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ history: [] }))
    const wrapper = shallow(<History />)
    chai.expect(wrapper.name()).to.equal('ul')
    chai.expect(wrapper.prop('style')).to.include(styles.hide)
  })

  it('should show history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({
        showHistory: true,
        history: []
      }))

    const wrapper = shallow(<History />)
    chai.expect(wrapper.prop('style')).to.not.include(styles.hide)
  })

  it('should render a history item', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({
        history: [{
          id: 1,
          action: {}
        }]
      }))

    const wrapper = shallow(<History />)
    chai.expect(wrapper.children()).to.have.length(1)
    chai.expect(wrapper.childAt(0).key()).to.equal('1')
    chai.expect(wrapper.childAt(0).prop('record')).to.eql({
      id: 1,
      action: {}
    })
  })

  it('should pass refAnchor to history item', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({
        history: [{
          id: 1,
          action: {}
        }]
      }))

    const wrapper = shallow(<History />)
    chai.expect(wrapper.children()).to.have.length(1)
    chai.expect(wrapper.childAt(0).prop('refAnchor')).to.have.property('current')
  })

  it('should render multiple history items', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({
        history: [{
          id: 1,
          action: {}
        }, {
          id: 2,
          anchor: true,
          action: {}
        }]
      }))

    const wrapper = shallow(<History />)
    chai.expect(wrapper.children()).to.have.length(2)
    chai.expect(wrapper.childAt(1).key()).to.equal('2')
    chai.expect(wrapper.childAt(1).prop('record')).to.eql({
      id: 2,
      anchor: true,
      action: {}
    })
  })

  describe('with jsdom', () => {

    beforeEach(() => {
      const dom = new JSDOM('<html></html>')
      global.window = dom.window
      global.document = dom.window.document
      global.Element = dom.window.Element
    })

    it('should reference list for scroll-into-view', () => {
      sandbox.spy(React, 'createRef')
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({ history: [] }))

      mount(<History />)
      chai.expect(React.createRef.callCount).to.equal(2)
      chai.expect(React.createRef.returnValues[0].current).to.have.property('tagName', 'UL')
    })

    it('should reference anchor for scroll-into-view', () => {
      sandbox.spy(React, 'createRef')
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({
          history: [{
            id: 1,
            anchor: true,
            action: {}
          }]
        }))

      const wrapper = mount(<History />)
      wrapper.setProps({})
      chai.expect(React.createRef.callCount).to.equal(2)
      chai.expect(React.createRef.returnValues[1].current).to.have.property('tagName', 'LI')
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
