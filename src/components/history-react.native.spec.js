/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { shallow } from 'enzyme'
import 'react-native-mock-render/mock'
import { TouchableOpacity, ListView, View, Text } from 'react-native'
import {
  requireIOS,
  requireAndroid } from '../utils/test-util'
import * as TimeTravelAction from '../actions/timetravel-action'

const renderFirstRow = (History, props) => {
  const wrapper = shallow(<History { ...props } />)
  const renderRow = wrapper.find(ListView).prop('renderRow')
  return renderRow(props.timetravel.history[0])
}

describe('History Component for react-native', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    delete require.cache[require.resolve('./history-react.native')]
  })

  describe('on ios', () => {

    let History, styles

    beforeEach(() => {
      requireIOS(sandbox, [
        './history-style'
      ])

      styles = require('./history-style').default
      History = require('./history-react.native').History
    })

    it('should render nothing by default', () => {
      const wrapper = shallow(<History />)
      chai.expect(wrapper.type()).to.be.null
    })

    it('should setup an empty data source', () => {
      const props = {
        timetravel: {
          history: []
        }
      }

      const wrapper = shallow(<History { ...props } />)
      const list = wrapper.childAt(0)
      chai.expect(list.type()).to.equal(ListView)
      chai.expect(list.prop('dataSource')).to.eql({ _dataBlob: [] })
    })

    it('should setup data source for a history item', () => {
      const props = {
        timetravel: {
          history: [{
            id: 1,
            action: {}
          }]
        }
      }

      const wrapper = shallow(<History { ...props } />)
      const list = wrapper.childAt(0)
      chai.expect(list.type()).to.equal(ListView)
      chai.expect(list.prop('dataSource')).to.eql({
        _dataBlob: [{
          id: 1,
          action: {}
        }]
      })
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

      const node = renderFirstRow(History, props)
      chai.expect(node.type).to.equal(View)
      chai.expect(node.props.style).to.be.empty
    })

    it('should highlight the anchor', () => {
      const props = {
        timetravel: {
          history: [{
            id: 1,
            anchor: true,
            action: {}
          }]
        }
      }

      const node = renderFirstRow(History, props)
      chai.expect(node.props.style).to.include(styles.anchor)
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

      const node = renderFirstRow(History, props)
      const wrapper = shallow(<component { ...node.props } />)
      chai.expect(wrapper.find(Text).childAt(0).text()).to.equal('TYPE')
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

      const node = renderFirstRow(History, props)
      const wrapper = shallow(<component { ...node.props } />)
      const params = wrapper.children(View).find(Text)
      chai.expect(params).to.have.length(1)
      chai.expect(params.key()).to.equal('param')
      chai.expect(params.children()).to.have.length(3)
      chai.expect(params.childAt(1).text()).to.equal(': ')
      chai.expect(params.childAt(2).text()).to.equal('"value"')
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

      const node = renderFirstRow(History, props)
      const wrapper = shallow(<component { ...node.props } />)
      const params = wrapper.children(View).find(Text)
      chai.expect(params).to.have.length(1)
      chai.expect(params.key()).to.equal('nested')
      chai.expect(params.childAt(2).text()).to.equal('{\n  param: "value" }')
    })

    it('should reference wrap for scroll-into-view', () => {
      const props = {
        refWrap: sinon.stub(),
        timetravel: {
          history: []
        }
      }

      const wrapper = shallow(<History { ...props } />)
      chai.expect(wrapper.getElement().ref).to.equal(props.refWrap)
    })

    it('should reference list for scroll-into-view', () => {
      const props = {
        refList: sinon.stub(),
        timetravel: {
          history: []
        }
      }

      const wrapper = shallow(<History { ...props } />)
      const list = wrapper.find(ListView)
      chai.expect(list.getElement().ref).to.equal(props.refList)
    })

    it('should reference anchor for scroll-into-view', () => {
      const props = {
        refAnchor: sinon.stub(),
        timetravel: {
          history: [{
            id: 1,
            anchor: true,
            action: {}
          }]
        }
      }

      const node = renderFirstRow(History, props)
      chai.expect(node.ref).to.equal(props.refAnchor)
    })

    it('should revert on press', () => {
      sandbox.stub(TimeTravelAction, 'revert')

      const props = {
        dispatch: sinon.stub(),
        timetravel: {
          history: [{
            id: 1,
            action: {}
          }]
        }
      }

      const node = renderFirstRow(History, props)
      const wrapper = shallow(<component { ...node.props } />)
      wrapper.find(TouchableOpacity).simulate('press')
      chai.expect(TimeTravelAction.revert.calledOnce).to.be.true
      chai.expect(TimeTravelAction.revert.lastCall.args[0]).to.equal(1)
    })

    it('should style action type', () => {
      const props = {
        timetravel: {
          history: [{
            id: 1,
            action: {}
          }]
        }
      }

      const node = renderFirstRow(History, props)
      const wrapper = shallow(<component { ...node.props } />)
      const text = wrapper.children(TouchableOpacity).find(Text)
      chai.expect(text.prop('style')).to.include(styles.actionType)
    })

    it('should style action value', () => {
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

      const node = renderFirstRow(History, props)
      const wrapper = shallow(<component { ...node.props } />)
      const text = wrapper.children(View).find(Text)
      chai.expect(text.prop('style')).to.include(styles.actionValue)
    })

  })

  describe('on android', () => {

    let History, styles
    let isEqualRecord

    beforeEach(() => {
      requireAndroid(sandbox, [
        './history-style'
      ])

      styles = require('./history-style').default
      History = require('./history-react.native').History
      isEqualRecord = require('./history-react.native').isEqualRecord
    })

    it('should style action type', () => {
      const props = {
        timetravel: {
          history: [{
            id: 1,
            action: {}
          }]
        }
      }

      const node = renderFirstRow(History, props)
      const wrapper = shallow(<component { ...node.props } />)
      const text = wrapper.children(TouchableOpacity).find(Text)
      chai.expect(text.prop('style')).to.include(styles.actionType)
    })

    it('should style action value', () => {
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

      const node = renderFirstRow(History, props)
      const wrapper = shallow(<component { ...node.props } />)
      const text = wrapper.children(View).find(Text)
      chai.expect(text.prop('style')).to.include(styles.actionValue)
    })

    it('should compare history records to be equal', () => {
      const record1 = { id: 1 }
      const record2 = { id: 1 }
      chai.expect(isEqualRecord(record1, record2)).to.be.true
    })

    it('should compare anchor records to be equal', () => {
      const record1 = { id: 1, anchor: true }
      const record2 = { id: 1, anchor: true }
      chai.expect(isEqualRecord(record1, record2)).to.be.true
    })

    it('should compare history records to be different', () => {
      const record1 = { id: 1 }
      const record2 = { id: 2 }
      chai.expect(isEqualRecord(record1, record2)).to.be.false
    })

    it('should compare anchor records to be different', () => {
      const record1 = { id: 1, anchor: true }
      const record2 = { id: 1, anchor: false }
      chai.expect(isEqualRecord(record1, record2)).to.be.false
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
