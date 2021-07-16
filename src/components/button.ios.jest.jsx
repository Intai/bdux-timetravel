/* eslint-env jest */

import * as R from 'ramda'
import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { shallow } from 'enzyme'
import { TouchableOpacity, Text } from 'react-native'
import Button from './button'
import styles from './button-style'

describe('Button Component for ios', () => {

  it('should wrap inside touchable', () => {
    const wrapper = shallow(<Button />)
    chai.expect(wrapper.type()).to.equal(TouchableOpacity)
  });

  it('should have default text style', () => {
    const wrapper = shallow(<Button />)
    const text = wrapper.find(Text)
    chai.expect(text.prop('style')).to.include(styles.text)
    chai.expect(styles.text).to.have.property('fontFamily', 'Helvetica Neue')
  })

  it('should be able to style color', () => {
    const wrapper = shallow(<Button style={{ color: 'red' }} />)
    const text = wrapper.find(Text)
    const style = R.assoc('color', 'red', styles.text)
    chai.expect(text.prop('style')).to.include(style)
  })

  it('should not be able to style marginTop', () => {
    const wrapper = shallow(<Button style={{ marginTop: 'test' }} />)
    const text = wrapper.find(Text)
    chai.expect(text.prop('style')).to.not.have.property('marginTop')
  })

  it('should render child text', () => {
    const wrapper = shallow(<Button>Click</Button>)
    const text = wrapper.find(Text)
    chai.expect(text.prop('children')).to.equal('Click')
  })

  it('should trigger click event', () => {
    const onClick = sinon.stub()
    const wrapper = shallow(<Button onClick={onClick} />)
    wrapper.simulate('press')
    chai.expect(onClick.calledOnce).to.be.true
  })

})
