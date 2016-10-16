/* eslint-env mocha */

import chai from 'chai'
import React from 'react'
import { shallow } from 'enzyme'
import { View, Text } from 'react-native'
import { Container } from './container-react.native'

describe('Container Component for react-native', () => {

  it('should be a view', () => {
    const wrapper = shallow(<Container />)
    chai.expect(wrapper.name()).to.equal('View')
  })

  it('should be able to style color', () => {
    const wrapper = shallow(<Container style={{ color: 'test' }} />)
    chai.expect(wrapper.prop('style')).to.have.property('color', 'test')
  })

  it('should render child text', () => {
    const wrapper = shallow(<Container>Click</Container>)
    chai.expect(wrapper.prop('children')).to.equal('Click')
  })

  it('should render children', () => {
    const wrapper = shallow(<Container><View /><Text /></Container>)
    chai.expect(wrapper.childAt(0).type()).to.equal(View)
    chai.expect(wrapper.childAt(1).type()).to.equal(Text)
  })

})
