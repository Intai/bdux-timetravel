/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import * as R from 'ramda'
import * as Bacon from 'baconjs'
import { JSDOM } from 'jsdom'
import { fireEvent, render } from '@testing-library/react'
import { createDispatcher, BduxContext } from 'bdux'
import * as TimeTravelAction from '../actions/timetravel-action'
import TimeTravelStore from '../stores/timetravel-store'
import { TimeTravel } from './timetravel'
import Container from './container'
import Button from './button'
import History from './history'
import styles from './timetravel-style'
import historyStyles from './history-style'

describe('TimeTravel Component', () => {

  let sandbox

  beforeEach(() => {
    const dom = new JSDOM('<html></html>')
    global.window = dom.window
    global.document = dom.window.document
    global.Element = dom.window.Element
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should limit height to hide history', () => {
    const { container } = render(<TimeTravel />)
    chai.expect(container.firstChild.style).to.include({
      ...styles.container,
      ...styles.hideHistory,
    })
  })

  it('should hide history according to timetravel store', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ showHistory: false }))
    const { container } = render(<TimeTravel />)
    chai.expect(container.firstChild.style).to.include(styles.hideHistory)
  })

  it('should show history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ showHistory: true }))
    const { container } = render(<TimeTravel />)
    chai.expect(container.firstChild.style).to.not.include(styles.hideHistory)
  })

  it('should render three buttons', () => {
    const { container } = render(<TimeTravel />)
    chai.expect(container.querySelectorAll('button')).to.have.length(3)
  })

  it('should render the first button to restart', () => {
    const { container } = render(<TimeTravel />)
    const button = container.querySelector('button')
    chai.expect(button.innerHTML).to.equal('Restart')
  })

  it('should render the second button to declutch', () => {
    const { container } = render(<TimeTravel />)
    const button = container.querySelectorAll('button')[1]
    chai.expect(button.innerHTML).to.equal('Declutch')
  })

  it('should render the second button to clutch', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ declutch: true }))
    const { container } = render(<TimeTravel />)
    const button = container.querySelectorAll('button')[1]
    chai.expect(button.innerHTML).to.equal('Clutch')
  })

  it('should render the third button to show history', () => {
    const { container } = render(<TimeTravel />)
    const button = container.querySelectorAll('button')[2]
    chai.expect(button.innerHTML).to.equal('Show History')
  })

  it('should render the third button to hide history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ showHistory: true }))
    const { container } = render(<TimeTravel />)
    const button = container.querySelectorAll('button')[2]
    chai.expect(button.innerHTML).to.equal('Hide History')
  })

  it('should render history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ history: [] }))
    const { container } = render(<TimeTravel />)
    const history = container.firstChild.lastChild
    chai.expect(history.innerHTML).to.be.empty
    chai.expect(history.style).to.include(historyStyles.list)
  })

  describe('with dispatcher', () => {

    const dispatcher = createDispatcher()
    const context = {
      dispatcher,
      stores: new WeakMap()
    }

    beforeEach(() => {
      sandbox.stub(dispatcher, 'bindToDispatch')
        .callsFake(R.identity)
    })

    it('should click to restart action', () => {
      sandbox.spy(TimeTravelAction, 'restart')
      const { container } = render(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = container.querySelector('button')
      fireEvent.click(button)
      chai.expect(TimeTravelAction.restart.calledOnce).to.be.true
    })

    it('should click to declutch action', () => {
      sandbox.spy(TimeTravelAction, 'declutch')
      const { container } = render(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = container.querySelectorAll('button')[1]
      fireEvent.click(button)
      chai.expect(TimeTravelAction.declutch.calledOnce).to.be.true
    })

    it('should click to clutch action', () => {
      sandbox.spy(TimeTravelAction, 'clutch')
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({ declutch: true }))
      const { container } = render(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = container.querySelectorAll('button')[1]
      fireEvent.click(button)
      chai.expect(TimeTravelAction.clutch.calledOnce).to.be.true
    })

    it('should click to toggle history', () => {
      sandbox.spy(TimeTravelAction, 'toggleHistory')
      const { container } = render(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = container.querySelectorAll('button')[2]
      fireEvent.click(button)
      chai.expect(TimeTravelAction.toggleHistory.calledOnce).to.be.true
    })

    it('should click to hide history', () => {
      sandbox.spy(TimeTravelAction, 'toggleHistory')
      sandbox.stub(TimeTravelStore, 'getProperty')
        .returns(Bacon.constant({ showHistory: true }))
      const { container } = render(
        <div>
          <BduxContext.Provider value={context}>
            <TimeTravel />
          </BduxContext.Provider>
        </div>
      )
      const button = container.querySelectorAll('button')[2]
      fireEvent.click(button)
      chai.expect(TimeTravelAction.toggleHistory.calledOnce).to.be.true
    })

  })

})
