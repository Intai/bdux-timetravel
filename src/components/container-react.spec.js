/* eslint-env mocha */

import chai from 'chai'
import React from 'react'
import { shallow } from 'enzyme'
import { Container } from './container-react'

describe('Container Component', () => {

  it('should be a div element', () => {
    const wrapper = shallow(<Container />)
    chai.expect(wrapper.name()).to.equal('div')
  })

  it('should be able to style color', () => {
    const wrapper = shallow(<Container style={{ color: 'test' }} />)
    chai.expect(wrapper.prop('style')).to.have.property('color', 'test')
  })

  it('should render child text', () => {
    const wrapper = shallow(<Container>Click</Container>)
    chai.expect(wrapper.text()).to.equal('Click')
  })

  it('should render children', () => {
    const wrapper = shallow(<Container><div /><span /></Container>)
    chai.expect(wrapper.childAt(0).type()).to.equal('div')
    chai.expect(wrapper.childAt(1).type()).to.equal('span')
  })

})
