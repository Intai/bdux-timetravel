/* eslint-env mocha */

import * as R from 'ramda'
import chai from 'chai'
import sinon from 'sinon'
import React, { useCallback, useMemo } from 'react'
import { JSDOM } from 'jsdom'
import { fireEvent, render } from '@testing-library/react'
import { applyMiddleware, clearMiddlewares } from 'bdux'
import ButtonWithMemo, { Button } from './button'
import styles from './button-style'

describe('Button Component', () => {

  beforeEach(() => {
    const dom = new JSDOM('<html></html>')
    global.window = dom.window
    global.document = dom.window.document
    global.Element = dom.window.Element
  })

  it('should be a button element', () => {
    const { container } = render(<Button />)
    const button = container.firstChild
    chai.expect(button.tagName).to.equal('BUTTON')
  })

  it('should have default button style', () => {
    const { container } = render(<Button />)
    const button = container.firstChild
    chai.expect(button.style).to.include(styles.button)
  })

  it('should be able to style color', () => {
    const { container } = render(<Button style={{ color: 'red' }} />)
    const button = container.firstChild
    chai.expect(button.style.color).to.equal('red')
  })

  it('should be able to style marginTop', () => {
    const { container } = render(<Button style={{ marginTop: '10px' }} />)
    const button = container.firstChild
    chai.expect(button.style.marginTop).to.equal('10px')
  })

  it('should not be able to style paddingTop', () => {
    const { container } = render(<Button style={{ paddingTop: '9999px' }} />)
    const button = container.firstChild
    chai.expect(button.style).to.include(styles.button)
  })

  it('should render child text', () => {
    const { container } = render(<Button>Click</Button>)
    const button = container.firstChild
    chai.expect(button.innerHTML).to.equal('Click')
  })

  it('should render children', () => {
    const { container } = render(<Button><div /><span /></Button>)
    const button = container.firstChild
    chai.expect(button.firstChild.tagName).to.equal('DIV')
    chai.expect(button.childNodes[1].tagName).to.equal('SPAN')
  })

  it('should trigger click event', () => {
    const onClick = sinon.stub()
    const { container } = render(<Button onClick={onClick}/>)
    fireEvent.click(container.firstChild)
    chai.expect(onClick.calledOnce).to.be.true
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

    it('should not render with the same callcak', () => {
      const createAction = sinon.stub()
      const Test = (props) => {
        const handleClick = useCallback(() => { createAction(props.id) }, [props.id])
        return <ButtonWithMemo onClick={handleClick} />
      }

      const { rerender } = render(<Test id="1" />)
      rerender(<Test id="1" />)
      chai.expect(useHook.callCount).to.equal(1)
    })

    it('should render with a new callcak', () => {
      const createAction = sinon.stub()
      const Test = (props) => {
        const handleClick = useCallback(() => { createAction(props.id) }, [props.id])
        return <ButtonWithMemo onClick={handleClick} />
      }

      const { rerender } = render(<Test id="1" />)
      rerender(<Test id="2" />)
      chai.expect(useHook.callCount).to.equal(2)
    })

    it('should not render with the same children', () => {
      const Test = (props) => {
        const content = useMemo(() => <span>{props.content}</span>, [props.content])
        return <ButtonWithMemo>{content}</ButtonWithMemo>
      }

      const { rerender } = render(<Test content="1" />)
      rerender(<Test content="1" />)
      chai.expect(useHook.callCount).to.equal(1)
    })

    it('should render with a different children', () => {
      const Test = (props) => {
        const content = useMemo(() => <span>{props.content}</span>, [props.content])
        return <ButtonWithMemo>{content}</ButtonWithMemo>
      }

      const { rerender } = render(<Test content="1" />)
      rerender(<Test content="2" />)
      chai.expect(useHook.callCount).to.equal(2)
    })

  })

})
