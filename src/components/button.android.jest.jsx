/* eslint-env jest */

import * as R from 'ramda'
import chai from 'chai'
import React from 'react'
import { shallow } from 'enzyme'
import { Text } from 'react-native'
import Button from './button'
import styles from './button-style'

describe('Button Component for android', () => {

  it('should have default text style', () => {
    const wrapper = shallow(<Button />)
    const text = wrapper.find(Text)
    chai.expect(text.prop('style')).to.include(styles.text)
    chai.expect(styles.text).to.have.property('fontFamily', 'Droid Sans')
  })

  it('should be able to style color', () => {
    const wrapper = shallow(<Button style={{ color: 'blue' }} />)
    const text = wrapper.find(Text)
    const style = R.assoc('color', 'blue', styles.text)
    chai.expect(text.prop('style')).to.include(style)
  })

})
