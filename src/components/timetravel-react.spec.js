/* eslint-env mocha */

import chai from 'chai'
import React from 'react'
import { shallow } from 'enzyme'
import TimeTravelAction from '../actions/timetravel-action'
import { TimeTravel } from './timetravel-react'
import styles from './timetravel-style'

describe('TimeTravel Component', () => {

  it('should wrap inside a container', () => {
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.name()).to.equal('Container')
  })

  it('should limit height to hide history', () => {
    const wrapper = shallow(TimeTravel({}))
    chai.expect(wrapper.prop('style')).to.include(styles.hideHistory)
  })

  it('should hide history according to timetravel store', () => {
    const wrapper = shallow(TimeTravel({ timetravel: { showHistory: false }}))
    chai.expect(wrapper.prop('style')).to.include(styles.hideHistory)
  })

  it('should show history', () => {
    const wrapper = shallow(TimeTravel({ timetravel: { showHistory: true }}))
    chai.expect(wrapper.prop('style')).to.not.include(styles.hideHistory)
  })

  it('should render three buttons', () => {
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.find('Button')).to.have.length(3)
  })

  it('should render the first button to restart', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').first().shallow()
    chai.expect(button.prop('children')).to.equal('Restart')
  })

  it('should click to restart action', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').first().shallow()
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.restart)
  })

  it('should render the second button to declutch', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').at(1).shallow()
    chai.expect(button.prop('children')).to.equal('Declutch')
  })

  it('should click to declutch action', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').at(1).shallow()
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.declutch)
  })

  it('should render the second button to clutch', () => {
    const wrapper = shallow(TimeTravel({ timetravel: { declutch: true }}))
    const button = wrapper.find('Button').at(1).shallow()
    chai.expect(button.prop('children')).to.equal('Clutch')
  })

  it('should click to clutch action', () => {
    const wrapper = shallow(TimeTravel({ timetravel: { declutch: true }}))
    const button = wrapper.find('Button').at(1).shallow()
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.clutch)
  })

  it('should render the third button to show history', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').at(2).shallow()
    chai.expect(button.prop('children')).to.equal('Show History')
  })

  it('should click to toggle history', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').at(2).shallow()
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.toggleHistory)
  })

  it('should render the third button to hide history', () => {
    const wrapper = shallow(TimeTravel({ timetravel: { showHistory: true }}))
    const button = wrapper.find('Button').at(2).shallow()
    chai.expect(button.prop('children')).to.equal('Hide History')
  })

  it('should click to hide history', () => {
    const wrapper = shallow(TimeTravel({ timetravel: { showHistory: true }}))
    const button = wrapper.find('Button').at(2).shallow()
    chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.toggleHistory)
  })

  it('should render history', () => {
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.find('History')).to.have.length(1)
  })

})
