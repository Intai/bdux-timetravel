/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as R from 'ramda'
import React from 'react'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { decorateComponent as resume } from './resume'
import TimeTravelAction from '../../actions/timetravel-action';

describe('Resume Decorator', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
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
    const Test = resume(R.F)
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

  it('should pass on all props', () => {
    const Component = sinon.stub().returns(false)
    const Test = resume(Component)
    shallow(<Test id="id" name="name" />).shallow()
    chai.expect(Component.calledOnce).to.be.true
    chai.expect(Component.firstCall.args[0]).to.eql({
      id: 'id',
      name: 'name'
    })
  })

  describe('with jsdom', () => {

    beforeEach(() => {
      const dom = new JSDOM('<html></html>')
      global.window = dom.window
      global.document = dom.window.document
      global.Element = dom.window.Element
    })

    it('should create a resume action on mount', () => {
      sandbox.stub(TimeTravelAction, 'resume')
      const Test = resume()
      mount(<Test />)
      chai.expect(TimeTravelAction.resume.calledOnce).to.be.true
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
