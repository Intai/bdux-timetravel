/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import * as R from 'ramda'
import * as Bacon from 'baconjs'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { createDispatcher, BduxContext } from 'bdux'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import { TimeTravel } from './timetravel-react'
import Button from './button-react'
import styles from './timetravel-style'

describe('TimeTravel Component', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  it('should wrap inside a container', () => {
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.name()).to.equal('Container')
  })

  it('should limit height to hide history', () => {
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.prop('style')).to.include(styles.hideHistory)
  })

  it('should hide history according to timetravel store', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ showHistory: false }))
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.prop('style')).to.include(styles.hideHistory)
  })

  it('should show history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ showHistory: true }))
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.prop('style')).to.not.include(styles.hideHistory)
  })

  it('should render three buttons', () => {
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.find('Button')).to.have.length(3)
  })

  it('should render the first button to restart', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').first()
    chai.expect(button.prop('children')).to.equal('Restart')
  })

  it('should render the second button to declutch', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').at(1)
    chai.expect(button.prop('children')).to.equal('Declutch')
  })

  it('should render the second button to clutch', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ declutch: true }))
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').at(1)
    chai.expect(button.prop('children')).to.equal('Clutch')
  })

  it('should render the third button to show history', () => {
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').at(2)
    chai.expect(button.prop('children')).to.equal('Show History')
  })

  it('should render the third button to hide history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ showHistory: true }))
    const wrapper = shallow(<TimeTravel />)
    const button = wrapper.find('Button').at(2)
    chai.expect(button.prop('children')).to.equal('Hide History')
  })

  it('should render history', () => {
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.find('History')).to.have.length(1)
  })

  describe('with jsdom', () => {

    const dispatcher = createDispatcher()
    const context = {
      dispatcher,
      stores: new WeakMap()
    }

    beforeEach(() => {
      const dom = new JSDOM('<html></html>')
      global.window = dom.window
      global.document = dom.window.document
      global.Element = dom.window.Element

      sandbox.stub(dispatcher, 'bindToDispatch')
        .callsFake(R.identity)
    })

    it('should click to restart action', () => {
      const wrapper = mount(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = wrapper.find(Button).first()
      chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.restart)
    })

    it('should click to declutch action', () => {
      const wrapper = mount(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = wrapper.find(Button).at(1)
      chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.declutch)
    })

    it('should click to clutch action', () => {
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({ declutch: true }))
      const wrapper = mount(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = wrapper.find(Button).at(1)
      chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.clutch)
    })

    it('should click to toggle history', () => {
      const wrapper = mount(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = wrapper.find(Button).at(2)
      chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.toggleHistory)
    })

    it('should click to hide history', () => {
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({ showHistory: true }))
      const wrapper = mount(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = wrapper.find(Button).at(2)
      chai.expect(button.prop('onClick')).to.equal(TimeTravelAction.toggleHistory)
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
