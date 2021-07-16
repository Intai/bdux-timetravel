/* eslint-env jest */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import * as Bacon from 'baconjs'
import { shallow } from 'enzyme'
import { TouchableOpacity, FlatList, Text } from 'react-native'
import TimeTravelStore from '../stores/timetravel-store'
import History from './history'
import styles from './history-style'

const renderFirstRow = (History, timetravel) => {
  const wrapper = shallow(<History />)
  const renderRow = wrapper.find(FlatList).prop('renderItem')
  return renderRow({ item: timetravel.history[0] })
}

describe('History Component for android', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
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

})
