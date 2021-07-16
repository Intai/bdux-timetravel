/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React, { useMemo } from 'react'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { applyMiddleware, clearMiddlewares } from 'bdux'
import HistoryItemWithMemo, { HistoryItem } from './history-item'
import styles from './history-style'
import * as TimeTravelAction from '../actions/timetravel-action'

describe('HistoryItem Component', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  it('should render nothing by default', () => {
    const wrapper = shallow(<HistoryItem />)
    chai.expect(wrapper.type()).to.be.null
  })

  it('should render a history item', () => {
    const props = {
      record: {
        id: 1,
        action: {}
      }
    }

    const wrapper = shallow(<HistoryItem {...props} />)
    chai.expect(wrapper.type()).to.equal('li')
  })

  it('should highlight the anchor', () => {
    const props = {
      record: {
        id: 2,
        anchor: true,
        action: {}
      }
    }

    const wrapper = shallow(<HistoryItem {...props} />)
    chai.expect(wrapper.prop('style')).to.include(styles.anchor)
  })

  it('should render an action type', () => {
    const props = {
      record: {
        id: 1,
        action: {
          type: 'TYPE'
        }
      }
    }

    const wrapper = shallow(<HistoryItem {...props} />)
    chai.expect(wrapper.text()).to.equal('TYPE')
  })

  it('should render action parameters', () => {
    const props = {
      record: {
        id: 1,
        action: {
          param: 'value'
        }
      }
    }

    const wrapper = shallow(<HistoryItem {...props} />)
    const params = wrapper.find('ul')
    chai.expect(params.children()).to.have.length(1)
    chai.expect(params.childAt(0).key()).to.equal('param')
    chai.expect(params.childAt(0).text()).to.match(/^param:\s+"value"$/)
  })

  it('should serialise action parameters', () => {
    const props = {
      record: {
        id: 1,
        action: {
          nested: {
            param: 'value'
          }
        }
      }
    }

    const wrapper = shallow(<HistoryItem {...props} />)
    const params = wrapper.find('ul')
    chai.expect(params.children()).to.have.length(1)
    chai.expect(params.childAt(0).key()).to.equal('nested')
    chai.expect(params.childAt(0).text()).to.match(/^nested:\s+{\s+param:\s+"value"\s+}$/)
  })

  describe('with jsdom', () => {

    let useHook

    beforeEach(() => {
      const dom = new JSDOM('<html></html>')
      global.window = dom.window
      global.document = dom.window.document
      global.Element = dom.window.Element

      useHook = sinon.stub()
      applyMiddleware({
        useHook
      })
    })

    it('should reference anchor item for scroll-into-view', () => {
      const props = {
        refAnchor: sinon.stub(),
        record: {
          id: 1,
          anchor: true,
          action: {}
        }
      }

      mount(<HistoryItem { ...props } />)
      chai.expect(props.refAnchor.calledOnce).to.be.true
      chai.expect(props.refAnchor.lastCall.args[0]).to.have.property('tagName', 'LI')
    })

    it('should not reference non-anchor history item', () => {
      const props = {
        refAnchor: sinon.stub(),
        record: {
          id: 2,
          anchor: false,
          action: {}
        }
      }

      mount(<HistoryItem { ...props } />)
      chai.expect(props.refAnchor.called).to.be.false
    })

    it('should revert on click', () => {
      sandbox.stub(TimeTravelAction, 'revert')
      const props = {
        record: {
          id: 1,
          action: {}
        }
      }

      const wrapper = mount(<HistoryItem {...props} />)
      wrapper.find('div').first().simulate('click')
      chai.expect(TimeTravelAction.revert.calledOnce).to.be.true
      chai.expect(TimeTravelAction.revert.lastCall.args[0]).to.equal(1)
    })

    it('should not render with the same record', () => {
      const record = {
        id: 1,
        action: {}
      }

      const wrapper = mount(<HistoryItemWithMemo record={record} />)
      wrapper.setProps({ record })
      chai.expect(useHook.callCount).to.equal(1)
    })

    it('should render with a new record', () => {
      const record = {
        id: 1,
        action: {}
      }

      const wrapper = mount(<HistoryItemWithMemo />)
      wrapper.setProps({ record })
      chai.expect(useHook.callCount).to.equal(2)
    })

    it('should not render with the same ref', () => {
      const Test = () => {
        const refAnchor = useMemo(React.createRef, [])
        return <HistoryItemWithMemo refAnchor={refAnchor} />
      }

      const wrapper = mount(<Test />)
      wrapper.setProps({})
      chai.expect(useHook.callCount).to.equal(1)
    })

    it('should render with a new ref', () => {
      const Test = () => {
        const refAnchor = React.createRef()
        return <HistoryItemWithMemo refAnchor={refAnchor} />
      }

      const wrapper = mount(<Test />)
      wrapper.setProps({})
      chai.expect(useHook.callCount).to.equal(2)
    })

    afterEach(() => {
      clearMiddlewares()
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
