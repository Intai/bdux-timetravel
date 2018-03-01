/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as R from 'ramda'
import React from 'react'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { pureRender } from './pure-render'

describe('PureRender Decorator', () => {

  it('should create a react component', () => {
    const Test = pureRender(R.F)
    chai.expect(React.Component.isPrototypeOf(Test)).to.be.true
  })

  it('should keep the component name', () => {
    const Test = pureRender(class Test extends React.Component {})
    chai.expect(Test.displayName).to.equal('Test')
  })

  it('should set the default component name', () => {
    const Test = pureRender(R.F)
    chai.expect(Test.displayName).to.equal('Component')
  })

  it('should keep the component name from displayName', () => {
    // eslint-disable-next-line react/no-multi-comp
    const Test = pureRender(pureRender(class Test extends React.Component {}))
    chai.expect(Test.displayName).to.equal('Test')
  })

  it('should have no default props', () => {
    const Test = pureRender(R.F)
    chai.expect(Test.defaultProps).to.eql({})
  })

  it('should have no default state', () => {
    const Test = pureRender()
    const wrapper = shallow(<Test />)
    chai.expect(wrapper.state()).to.eql({})
  })

  it('should pass on all props', () => {
    const Component = sinon.stub().returns(false)
    const Test = pureRender(Component)
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

    it('should update the component', () => {
      const Component = sinon.stub().returns(false)
      const Test = pureRender(Component)
      const wrapper = mount(<Test />)
      wrapper.setProps({ id: 'id' })
      chai.expect(Component.calledTwice).to.be.true
      chai.expect(Component.lastCall.args[0]).to.have.property('id', 'id')
    })

    it('should not update the component', () => {
      const Component = sinon.stub().returns(false)
      const Test = pureRender(Component)
      const wrapper = mount(<Test name="name" />)
      wrapper.setProps({ name: 'name' })
      chai.expect(Component.calledOnce).to.be.true
    })

    it('should ignore function update', () => {
      const Component = sinon.stub().returns(false)
      const Test = pureRender(Component)
      const wrapper = mount(<Test refItem={R.T} />)
      wrapper.setProps({ refItem: R.F })
      chai.expect(Component.calledOnce).to.be.true
    })

  })

})
