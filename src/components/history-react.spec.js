/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { History } from './history-react'
import styles from './history-style'

describe('History Component', () => {

  it('should render nothing by default', () => {
    const wrapper = shallow(<History />)
    chai.expect(wrapper.type()).to.be.null
  })

  it('should render an empty history', () => {
    const props = {
      timetravel: {
        history: []
      }
    }

    const wrapper = shallow(History(props))
    chai.expect(wrapper.name()).to.equal('ul')
    chai.expect(wrapper.prop('style')).to.include(styles.hide)
  })

  it('should show history', () => {
    const props = {
      timetravel: {
        showHistory: true,
        history: []
      }
    }

    const wrapper = shallow(History(props))
    chai.expect(wrapper.prop('style')).to.not.include(styles.hide)
  })

  it('should render a history item', () => {
    const props = {
      timetravel: {
        history: [{
          id: 1,
          action: {}
        }]
      }
    }

    const wrapper = shallow(History(props))
    chai.expect(wrapper.children()).to.have.length(1)
    chai.expect(wrapper.childAt(0).key()).to.equal('1')
    chai.expect(wrapper.childAt(0).prop('record')).to.eql({
      id: 1,
      action: {}
    })
  })

  it('should pass refAnchor to history item', () => {
    const props = {
      refAnchor: sinon.stub(),
      timetravel: {
        history: [{
          id: 1,
          action: {}
        }]
      }
    }

    const wrapper = shallow(History(props))
    chai.expect(wrapper.children()).to.have.length(1)
    chai.expect(wrapper.childAt(0).prop('refAnchor')).to.equal(props.refAnchor)
  })

  it('should render multiple history items', () => {
    const props = {
      timetravel: {
        history: [{
          id: 1,
          action: {}
        }, {
          id: 2,
          anchor: true,
          action: {}
        }]
      }
    }

    const wrapper = shallow(History(props))
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
      const props = {
        refList: sinon.stub(),
        timetravel: {
          history: []
        }
      }

      mount(<History { ...props } />)
      chai.expect(props.refList.calledOnce).to.be.true
      chai.expect(props.refList.lastCall.args[0]).to.have.property('tagName', 'UL')
    })

  })

})
