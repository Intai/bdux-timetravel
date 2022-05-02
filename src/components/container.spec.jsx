/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React, { useMemo } from 'react'
import { JSDOM } from 'jsdom'
import { render } from '@testing-library/react'
import { applyMiddleware, clearMiddlewares } from 'bdux'
import ContainerWithMemo, { Container } from './container'

describe('Container Component', () => {

  beforeEach(() => {
    const dom = new JSDOM('<html></html>')
    global.window = dom.window
    global.document = dom.window.document
    global.Element = dom.window.Element
  })

  it('should be a div element', () => {
    const { container } = render(<Container />)
    chai.expect(container.firstChild.tagName).to.equal('DIV')
  })

  it('should be able to style color', () => {
    const { container } = render(<Container style={{ color: 'red' }} />)
    chai.expect(container.firstChild.style).to.have.property('color', 'red')
  })

  it('should render child text', () => {
    const { container } = render(<Container>Click</Container>)
    chai.expect(container.firstChild.innerHTML).to.equal('Click')
  })

  it('should render children', () => {
    const { container } = render(<Container><div /><span /></Container>)
    const element = container.firstChild
    chai.expect(element.firstChild.tagName).to.equal('DIV')
    chai.expect(element.childNodes[1].tagName).to.equal('SPAN')
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

    it('should not render with the same style', () => {
      const Test = (props) => {
        const containerProps = useMemo(() => ({
          style: { margin: props.margin },
          children: <>{props.margin}</>
        }), [props.margin])
        return <ContainerWithMemo {...containerProps} />
      }

      const { rerender } = render(<Test margin="10" />)
      rerender(<Test margin="10" />)
      chai.expect(useHook.callCount).to.equal(1)
    })

    it('should render with a different style', () => {
      const Test = (props) => {
        const containerProps = useMemo(() => ({
          style: { margin: props.margin },
          children: <>{props.margin}</>
        }), [props.margin])
        return <ContainerWithMemo {...containerProps} />
      }

      const { rerender } = render(<Test margin="10" />)
      rerender(<Test margin="20" />)
      chai.expect(useHook.callCount).to.equal(2)
    })

    it('should render repeatedly without memo hook', () => {
      const Test = (props) => <ContainerWithMemo style={{ style: props.margin }} />
      const { rerender } = render(<Test margin="10" />)
      rerender(<Test margin="10" />)
      rerender(<Test margin="10" />)
      chai.expect(useHook.callCount).to.equal(3)
    })

  })

})
