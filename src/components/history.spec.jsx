/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import * as Bacon from 'baconjs'
import { JSDOM } from 'jsdom'
import { render } from '@testing-library/react'
import TimeTravelStore from '../stores/timetravel-store'
import { History } from './history'
import styles from './history-style'

describe('History Component', () => {

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

  it('should render nothing by default', () => {
    const { container } = render(<History />)
    chai.expect(container.firstChild).to.be.null
  })

  it('should render an empty history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ history: [] }))
    const { container } = render(<History />)
    const history = container.firstChild
    chai.expect(history.tagName).to.equal('UL')
    chai.expect(history.style).to.include(styles.hide)
  })

  it('should show history', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({
        showHistory: true,
        history: []
      }))

    const { container } = render(<History />)
    const history = container.firstChild
    chai.expect(history.style).to.not.include(styles.hide)
  })

  it('should render a history item', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({
        history: [{
          id: 1,
          action: {
            type: 'TYPE',
            param: 'value',
          }
        }]
      }))

    const { container } = render(<History />)
    const history = container.firstChild
    const historyItem = history.firstChild
    chai.expect(history.childNodes).to.have.length(1)
    chai.expect(historyItem.firstChild.innerHTML).to.equal('TYPE')
    chai.expect(historyItem.childNodes[1].textContent).to.match(/^param:\s+"value"$/)
  })

  it('should render multiple history items', () => {
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({
        history: [{
          id: 1,
          action: {
            type: 'TYPE1',
          }
        }, {
          id: 2,
          anchor: true,
          action: {
            type: 'TYPE2',
            params: {
              a: null,
              b: undefined,
            }
          }
        }]
      }))

    const { container } = render(<History />)
    const history = container.firstChild
    const firstHistoryItem = history.firstChild
    const secondHistoryItem = history.childNodes[1]
    chai.expect(history.childNodes).to.have.length(2)
    chai.expect(firstHistoryItem.firstChild.innerHTML).to.equal('TYPE1')
    chai.expect(secondHistoryItem.firstChild.innerHTML).to.equal('TYPE2')
    chai.expect(secondHistoryItem.childNodes[1].textContent).to.match(/^params:\s+{\s+a:\s+null\s+}$/)
  })

  it('should reference list for scroll-into-view', () => {
    sandbox.spy(React, 'createRef')
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({ history: [] }))

    render(<History />)
    chai.expect(React.createRef.callCount).to.equal(2)
    chai.expect(React.createRef.returnValues[0].current).to.have.property('tagName', 'UL')
  })

  it('should reference anchor for scroll-into-view', () => {
    sandbox.spy(React, 'createRef')
    sandbox.stub(TimeTravelStore, 'getProperty')
      .returns(Bacon.constant({
        history: [{
          id: 1,
          anchor: true,
          action: {}
        }]
      }))

    const { rerender } = render(<History />)
    rerender(<History />)
    chai.expect(React.createRef.callCount).to.equal(2)
    chai.expect(React.createRef.returnValues[1].current).to.have.property('tagName', 'LI')
  })

})
