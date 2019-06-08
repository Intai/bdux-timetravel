/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import * as R from 'ramda'
import * as Bacon from 'baconjs'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import 'react-native-mock-render/mock'
import { TouchableOpacity, TouchableWithoutFeedback, FlatList, View, Text } from 'react-native'
import {
  requireIOS,
  requireAndroid } from '../utils/test-util'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'

const renderFirstRow = (History, timetravel) => {
  const wrapper = shallow(<History />)
  const renderRow = wrapper.find(FlatList).prop('renderItem')
  return renderRow({ item: timetravel.history[0] })
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
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({ history: [] }))
      const wrapper = shallow(<History />)
      const list = wrapper.childAt(0)
      chai.expect(list.type()).to.equal(FlatList)
      chai.expect(list.prop('data')).to.eql([])
    })

    it('should setup data source for a history item', () => {
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({
          history: [{
            id: 1,
            action: {}
          }]
        }))

      const wrapper = shallow(<History />)
      const list = wrapper.childAt(0)
      chai.expect(list.type()).to.equal(FlatList)
      chai.expect(list.prop('data')).to.eql([{
        id: 1,
        action: {}
      }])
    })

    it('should setup layout for each history item', () => {
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({
          history: [{
            id: 1,
            action: {}
          }]
        }))

      const wrapper = shallow(<History />)
      const list = wrapper.childAt(0)
      const getItemLayout = list.prop('getItemLayout')
      chai.expect(getItemLayout(null, 0)).to.eql({
        length: styles.item.height,
        offset: 0,
        index: 0,
      })
      chai.expect(getItemLayout(null, 1)).to.eql({
        length: styles.item.height,
        offset: styles.item.height,
        index: 1,
      })
    })

    it('should render a history item', () => {
      const timetravel = {
        history: [{
          id: 1,
          action: {}
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      chai.expect(node.type).to.equal(View)
      chai.expect(node.props.style).to.eql(styles.item)
    })

    it('should highlight the anchor', () => {
      const timetravel = {
        history: [{
          id: 1,
          anchor: true,
          action: {}
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      chai.expect(node.props.style).to.include(styles.anchor)
    })

    it('should render an action type', () => {
      const timetravel = {
        history: [{
          id: 1,
          action: {
            type: 'TYPE'
          }
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      const wrapper = shallow(<component { ...node.props } />)
      chai.expect(wrapper.find(Text).childAt(0).text()).to.equal('TYPE')
    })

    it('should render action parameters', () => {
      const timetravel = {
        history: [{
          id: 1,
          action: {
            param: 'value'
          }
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      const wrapper = shallow(<component { ...node.props } />)
      const params = wrapper.childAt(1).find(Text)
      chai.expect(params).to.have.length(1)
      chai.expect(params.key()).to.equal('param')
      chai.expect(params.children()).to.have.length(3)
      chai.expect(params.childAt(1).text()).to.equal(': ')
      chai.expect(params.childAt(2).text()).to.equal('"value"')
    })

    it('should serialise action parameters', () => {
      const timetravel = {
        history: [{
          id: 1,
          action: {
            nested: {
              param: 'value'
            }
          }
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      const wrapper = shallow(<component { ...node.props } />)
      const params = wrapper.childAt(1).find(Text)
      chai.expect(params).to.have.length(1)
      chai.expect(params.key()).to.equal('nested')
      chai.expect(params.childAt(2).text()).to.equal('{\n  param: "value" }')
    })

    it('should revert on press', () => {
      const timetravel = {
        history: [{
          id: 1,
          action: {}
        }]
      }

      sandbox.stub(TimeTravelAction, 'revert')
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      const wrapper = shallow(<component { ...node.props } />)
      wrapper.find(TouchableOpacity).simulate('press')
      chai.expect(TimeTravelAction.revert.calledOnce).to.be.true
      chai.expect(TimeTravelAction.revert.lastCall.args[0]).to.equal(1)
    })

    it('should style action type', () => {
      const timetravel = {
        history: [{
          id: 1,
          action: {}
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      const wrapper = shallow(<component { ...node.props } />)
      const text = wrapper.children(TouchableOpacity).find(Text)
      chai.expect(text.prop('style')).to.include(styles.actionType)
    })

    it('should style action value', () => {
      const timetravel = {
        history: [{
          id: 1,
          action: {
            param: 'value'
          }
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      const wrapper = shallow(<component { ...node.props } />)
      const text = wrapper.childAt(1).find(Text)
      chai.expect(text.prop('style')).to.include(styles.actionValue)
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
        chai.expect(React.createRef.returnValues[0].current)
          .to.have.nested.property('props.style')
          .and.to.equal(styles.list)
      })

      it('should reference the last anchor for scroll-into-view', () => {
        const timetravel = {
          history: [{
            id: 1,
            anchor: true,
            isLast: true,
            action: {}
          }]
        }

        sandbox.spy(React, 'createRef')
        sandbox.stub(TimeTravelStore, 'getProperty')
          .returns(Bacon.constant(timetravel))
        mount(<History />)
        chai.expect(React.createRef.callCount).to.equal(2)
        const anchor = React.createRef.returnValues[1].current
        chai.expect(anchor.getIndex()).to.equal(0)
        chai.expect(anchor.getId()).to.equal(1)
      })

      it('should not reference an anchor which is not the last for scroll-into-view', () => {
        const timetravel = {
          history: [{
            id: 1,
            anchor: true,
            action: {}
          }, {
            id: 2,
            action: {}
          }]
        }

        sandbox.spy(React, 'createRef')
        sandbox.stub(TimeTravelStore, 'getProperty')
          .returns(Bacon.constant(timetravel))
        mount(<History />)
        chai.expect(React.createRef.callCount).to.equal(2)
        const anchor = React.createRef.returnValues[1].current
        chai.expect(anchor.getIndex()).to.equal(-1)
        chai.expect(anchor.getId()).to.be.undefined
      })

      it('should expand on pressing params', () => {
        const timetravel = {
          history: [{
            id: 1,
            action: {}
          }]
        }

        sandbox.stub(TimeTravelStore, 'getProperty')
          .returns(Bacon.constant(timetravel))
        const wrapper = mount(<History />)
        wrapper.find(TouchableWithoutFeedback).prop('onPress')()
        wrapper.setProps({})
        chai.expect(wrapper.find(View).at(1).prop('style'))
          .to.include(R.merge(styles.item, styles.expand))
      })

      it('should toggle expand on pressing params', () => {
        const timetravel = {
          history: [{
            id: 1,
            action: {}
          }]
        }

        sandbox.stub(TimeTravelStore, 'getProperty')
          .returns(Bacon.constant(timetravel))
        const wrapper = mount(<History />)
        wrapper.find(TouchableWithoutFeedback).prop('onPress')()
        wrapper.setProps({})
        wrapper.find(TouchableWithoutFeedback).prop('onPress')()
        wrapper.setProps({})
        chai.expect(wrapper.find(View).at(1).prop('style'))
          .to.not.include(styles.expand)
      })

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
      const timetravel = {
        history: [{
          id: 1,
          action: {}
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      const wrapper = shallow(<component { ...node.props } />)
      const text = wrapper.children(TouchableOpacity).find(Text)
      chai.expect(text.prop('style')).to.include(styles.actionType)
    })

    it('should style action value', () => {
      const timetravel = {
        history: [{
          id: 1,
          action: {
            param: 'value'
          }
        }]
      }

      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant(timetravel))
      const node = renderFirstRow(History, timetravel)
      const wrapper = shallow(<component { ...node.props } />)
      const text = wrapper.childAt(1).find(Text)
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
