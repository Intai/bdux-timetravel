/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { jsdom } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { History } from './history-react'
import TimeTravelAction from '../actions/timetravel-action'

describe('History Component', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

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
    chai.expect(wrapper.prop('style')).to.have.property('flex', 0)
  })

  it('should show history', () => {
    const props = {
      timetravel: {
        showHistory: true,
        history: []
      }
    }

    const wrapper = shallow(History(props))
    chai.expect(wrapper.prop('style')).to.not.have.property('flex')
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
  })

  it('should highlight the anchor', () => {
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
    chai.expect(wrapper.childAt(0).prop('style')).to.not.have.property('background')
    chai.expect(wrapper.childAt(1).prop('style')).to.have.property('background')
  })

  it('should render an action type', () => {
    const props = {
      timetravel: {
        history: [{
          id: 1,
          action: {
            type: 'TYPE'
          }
        }]
      }
    }

    const wrapper = shallow(History(props))
    chai.expect(wrapper.children()).to.have.length(1)
    chai.expect(wrapper.childAt(0).text()).to.equal('TYPE')
  })

  it('should render action parameters', () => {
    const props = {
      timetravel: {
        history: [{
          id: 1,
          action: {
            param: 'value'
          }
        }]
      }
    }

    const wrapper = shallow(History(props))
    const params = wrapper.find('li > ul')
    chai.expect(params.children()).to.have.length(1)
    chai.expect(params.childAt(0).key()).to.equal('param')
    chai.expect(params.childAt(0).text()).to.equal('param: "value"')
  })

  it('should serialise action parameters', () => {
    const props = {
      timetravel: {
        history: [{
          id: 1,
          action: {
            nested: {
              param: 'value'
            }
          }
        }]
      }
    }

    const wrapper = shallow(History(props))
    const params = wrapper.find('li > ul')
    chai.expect(params.children()).to.have.length(1)
    chai.expect(params.childAt(0).key()).to.equal('nested')
    chai.expect(params.childAt(0).text()).to.equal('nested: { param: "value" }')
  })

  describe('with jsdom', () => {

    beforeEach(() => {
      const doc = jsdom('<html></html>')
      global.document = doc
      global.window = doc.defaultView
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

    it('should reference list item for scroll-into-view', () => {
      const props = {
        refAnchor: sinon.stub(),
        timetravel: {
          history: [{
            id: 1,
            anchor: true,
            action: {}
          }, {
            id: 2,
            action: {}
          }]
        }
      }

      mount(<History { ...props } />)
      chai.expect(props.refAnchor.calledOnce).to.be.true
      chai.expect(props.refAnchor.lastCall.args[0]).to.have.property('tagName', 'LI')
    })

    it('should revert on click', () => {
      sandbox.stub(TimeTravelAction, 'revert')

      const props = {
        timetravel: {
          history: [{
            id: 1,
            action: {}
          }]
        }
      }

      const wrapper = mount(History(props))
      wrapper.find('li > div').simulate('click')
      chai.expect(TimeTravelAction.revert.calledOnce).to.be.true
      chai.expect(TimeTravelAction.revert.lastCall.args[0]).to.equal(1)
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
