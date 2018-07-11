/* eslint-env mocha */

import chai from 'chai'
import React from 'react'
import * as R from 'ramda'
import { shallow } from 'enzyme'
import * as TimeTravelAction from '../actions/timetravel-action'
import { TimeTravel } from './timetravel-react'
import styles from './timetravel-style'

describe('TimeTravel Component', () => {

  const props = {
    bindToDispatch: R.identity
  }

  it('should wrap inside a container', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    chai.expect(wrapper.name()).to.equal('Container')
  })

  it('should limit height to hide history', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    chai.expect(wrapper.prop('style')).to.include(styles.hideHistory)
  })

  it('should hide history according to timetravel store', () => {
    const wrapper = shallow(<TimeTravel {...props} timetravel={{ showHistory: false }} />)
    chai.expect(wrapper.prop('style')).to.include(styles.hideHistory)
  })

  it('should show history', () => {
    const wrapper = shallow(<TimeTravel {...props} timetravel={{ showHistory: true }} />)
    chai.expect(wrapper.prop('style')).to.not.include(styles.hideHistory)
  })

  it('should render three buttons', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    chai.expect(wrapper.find('Button')).to.have.length(3)
  })

  it('should render the first button to restart', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    const button = wrapper.find('Button').first()
    chai.expect(button.prop('children')).to.equal('Restart')
  })

  it('should click to restart action', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    const button = wrapper.find('Button').first()
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.restart)
  })

  it('should render the second button to declutch', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    const button = wrapper.find('Button').at(1)
    chai.expect(button.prop('children')).to.equal('Declutch')
  })

  it('should click to declutch action', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    const button = wrapper.find('Button').at(1)
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.declutch)
  })

  it('should render the second button to clutch', () => {
    const wrapper = shallow(<TimeTravel {...props} timetravel={{ declutch: true }} />)
    const button = wrapper.find('Button').at(1)
    chai.expect(button.prop('children')).to.equal('Clutch')
  })

  it('should click to clutch action', () => {
    const wrapper = shallow(<TimeTravel {...props} timetravel={{ declutch: true }} />)
    const button = wrapper.find('Button').at(1)
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.clutch)
  })

  it('should render the third button to show history', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    const button = wrapper.find('Button').at(2)
    chai.expect(button.prop('children')).to.equal('Show History')
  })

  it('should click to toggle history', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    const button = wrapper.find('Button').at(2)
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.toggleHistory)
  })

  it('should render the third button to hide history', () => {
    const wrapper = shallow(<TimeTravel {...props} timetravel={{ showHistory: true }} />)
    const button = wrapper.find('Button').at(2)
    chai.expect(button.prop('children')).to.equal('Hide History')
  })

  it('should click to hide history', () => {
    const wrapper = shallow(<TimeTravel {...props} timetravel={{ showHistory: true }} />)
    const button = wrapper.find('Button').at(2)
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.toggleHistory)
  })

  it('should render history', () => {
    const wrapper = shallow(<TimeTravel {...props} />)
    chai.expect(wrapper.find('History')).to.have.length(1)
  })

})
