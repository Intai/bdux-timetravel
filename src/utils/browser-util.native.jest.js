/* eslint-env jest */

import chai from 'chai'
import Browser from './browser-util'

describe('Browser Utilities for react-native', () => {

  it('should have reload function', () => {
    chai.expect(Browser.reload).to.be.a('function')
      .and.not.throw()
  })

})
