/* eslint-env mocha */

import * as R from 'ramda'
import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { shallow } from 'enzyme'
import { Button } from './button-react'
import styles from './button-style'

describe('Button Component', () => {

  it('should be a button element', () => {
    const wrapper = shallow(<Button />)
    chai.expect(wrapper.name()).to.equal('button')
  })

  it('should have default button style', () => {
    const wrapper = shallow(<Button />)
    chai.expect(wrapper.prop('style')).to.include(styles.button)
  })

  it('should be able to style color', () => {
    const wrapper = shallow(<Button style={{ color: 'test' }} />)
    const style = R.assoc('color', 'test', styles.button)
    chai.expect(wrapper.prop('style')).to.include(style)
  })

  it('should be able to style marginTop', () => {
    const wrapper = shallow(<Button style={{ marginTop: 'test' }} />)
    const style = R.assoc('marginTop', 'test', styles.button)
    chai.expect(wrapper.prop('style')).to.include(style)
  })

  it('should not be able to style paddingTop', () => {
    const wrapper = shallow(<Button style={{ paddingTop: 'test' }} />)
    chai.expect(wrapper.prop('style')).to.include(styles.button)
  })

  it('should render child text', () => {
    const wrapper = shallow(<Button>Click</Button>)
    chai.expect(wrapper.text()).to.equal('Click')
  })

  it('should render children', () => {
    const wrapper = shallow(<Button><div /><span /></Button>)
    chai.expect(wrapper.childAt(0).type()).to.equal('div')
    chai.expect(wrapper.childAt(1).type()).to.equal('span')
  })

  it('should trigger click event', () => {
    const onClick = sinon.stub()
    const wrapper = shallow(<Button onClick={onClick}/>)
    wrapper.simulate('click')
    chai.expect(onClick.calledOnce).to.be.true
  })

})
