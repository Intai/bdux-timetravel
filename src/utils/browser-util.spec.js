/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import { reload } from './browser-util'

describe('Browser Utilities', () => {

  it('should reload location', () => {
    const funcReload = sinon.stub()
    global.document = { location: { reload: funcReload }}
    reload()
    chai.expect(funcReload.calledOnce).to.be.true
  })

})
