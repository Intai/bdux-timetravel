/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React, { useMemo } from 'react'
import { JSDOM } from 'jsdom'
import { fireEvent, render } from '@testing-library/react'
import { applyMiddleware, clearMiddlewares } from 'bdux'
import HistoryItemWithMemo, { HistoryItem } from './history-item'
import styles from './history-style'
import * as TimeTravelAction from '../actions/timetravel-action'

describe('HistoryItem Component', () => {

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
    const { container } = render(<HistoryItem />)
    const historyItem = container.firstChild
    chai.expect(historyItem).to.be.null
  })

  it('should render a history item', () => {
    const props = {
      record: {
        id: 1,
        action: {}
      }
    }

    const { container } = render(<HistoryItem {...props} />)
    const historyItem = container.firstChild
    chai.expect(historyItem.tagName).to.equal('LI')
  })

  it('should highlight the anchor', () => {
    const props = {
      record: {
        id: 2,
        anchor: true,
        action: {}
      }
    }

    const { container } = render(<HistoryItem {...props} />)
    const historyItem = container.firstChild
    chai.expect(historyItem.style).to.include(styles.anchor)
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

    const { container } = render(<HistoryItem {...props} />)
    const historyItem = container.firstChild
    chai.expect(historyItem.textContent).to.equal('TYPE')
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

    const { container } = render(<HistoryItem {...props} />)
    const historyItem = container.firstChild
    const params = historyItem.querySelector('ul')
    chai.expect(params.childNodes).to.have.length(1)
    chai.expect(params.firstChild.firstChild.innerHTML).to.equal('param')
    chai.expect(params.firstChild.textContent).to.match(/^param:\s+"value"$/)
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

    const { container } = render(<HistoryItem {...props} />)
    const historyItem = container.firstChild
    const params = historyItem.querySelector('ul')
    chai.expect(params.childNodes).to.have.length(1)
    chai.expect(params.firstChild.firstChild.innerHTML).to.equal('nested')
    chai.expect(params.firstChild.textContent).to.match(/^nested:\s+{\s+param:\s+"value"\s+}$/)
  })

  describe('with middleware', () => {

    let useHook

    beforeEach(() => {
      useHook = sinon.stub()
      applyMiddleware({
        useHook
      })
    })

    afterEach(() => {
      clearMiddlewares()
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

      render(<HistoryItem { ...props } />)
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

      render(<HistoryItem { ...props } />)
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

      const { container } = render(<HistoryItem {...props} />)
      const historyItem = container.firstChild
      fireEvent.click(historyItem.querySelector('div'))
      chai.expect(TimeTravelAction.revert.calledOnce).to.be.true
      chai.expect(TimeTravelAction.revert.lastCall.args[0]).to.equal(1)
    })

    it('should not render with the same record', () => {
      const record = {
        id: 1,
        action: {}
      }

      const { rerender } = render(<HistoryItemWithMemo record={record} />)
      rerender(<HistoryItemWithMemo record={record} />)
      chai.expect(useHook.callCount).to.equal(1)
    })

    it('should render with a new record', () => {
      const record = {
        id: 1,
        action: {}
      }

      const { rerender } = render(<HistoryItemWithMemo />)
      rerender(<HistoryItemWithMemo record={record} />)
      chai.expect(useHook.callCount).to.equal(2)
    })

    it('should not render with the same ref', () => {
      const Test = () => {
        const refAnchor = useMemo(React.createRef, [])
        return <HistoryItemWithMemo refAnchor={refAnchor} />
      }

      const { rerender } = render(<Test />)
      rerender(<Test />)
      chai.expect(useHook.callCount).to.equal(1)
    })

    it('should render with a new ref', () => {
      const Test = () => {
        const refAnchor = React.createRef()
        return <HistoryItemWithMemo refAnchor={refAnchor} />
      }

      const { rerender } = render(<Test />)
      rerender(<Test />)
      chai.expect(useHook.callCount).to.equal(2)
    })

  })

})
