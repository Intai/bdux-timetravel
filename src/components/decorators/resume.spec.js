/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as R from 'ramda'
import React from 'react'
import { JSDOM } from 'jsdom'
import { render } from '@testing-library/react'
import { decorateComponent as resume, useHook as useResumeHook } from './resume'
import { resume as createResumeAction } from '../../actions/timetravel-action';

describe('Resume Decorator', () => {

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

  it('should create a react component', () => {
    const Test = resume(R.F)
    chai.expect(React.Component.isPrototypeOf(Test)).to.be.true
  })

  it('should keep the component name', () => {
    const Test = resume(class Test extends React.Component {})
    chai.expect(Test.displayName).to.equal('Test')
  })

  it('should set the default component name', () => {
    const Test = resume(() => false)
    chai.expect(Test.displayName).to.equal('Component')
  })

  it('should keep the component name from displayName', () => {
    // eslint-disable-next-line react/no-multi-comp
    const Test = resume(resume(class Test extends React.Component {}))
    chai.expect(Test.displayName).to.equal('Test')
  })

  it('should have no default props', () => {
    const Test = resume(R.F)
    chai.expect(Test.defaultProps).to.eql({})
  })

  it('should render nothing', () => {
    const Test = resume()
    const { container } = render(<Test />)
    chai.expect(container.innerHTML).to.equal('')
  })

  it('should pass on all props', () => {
    const Component = sinon.stub().returns(false)
    const Test = resume(Component)
    render(<Test id="id" name="name" />)
    chai.expect(Component.calledOnce).to.be.true
    chai.expect(Component.firstCall.args[0]).to.eql({
      id: 'id',
      name: 'name'
    })
  })

  it('should create a resume action on mount', () => {
    const callback = sinon.stub()
    const Test = resume()
    render(<Test dispatch={callback} />)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.eql(createResumeAction())
  })

  it('should create a resume action using hook', () => {
    const callback = sinon.stub()
    const Test = (props) => {
      useResumeHook(props, { dispatch: callback })
      return false
    }
    render(<Test />)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.eql(createResumeAction())
  })

  it('should render using resume hook without dispatch', () => {
    const Test = (props) => {
      useResumeHook(props)
      return <span />
    }
    const { container } = render(<Test />)
    chai.expect(container.innerHTML).to.equal('<span></span>')
  })

})
