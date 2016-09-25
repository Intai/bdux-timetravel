/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Common, {
  canUseDOM,
  isReactNative,
  consoleClear,
  getTimeFunc } from './common-util'

describe('Common Utilities', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  it('should not be able to use dom when there is no window', () => {
    global.window = undefined
    chai.expect(canUseDOM()).to.not.be.ok
  })

  it('should not be able to use dom when there is no document', () => {
    global.window = { document: undefined }
    chai.expect(canUseDOM()).to.not.be.ok
  })

  it('should not be able to use dom when there is no function to create element', () => {
    global.window = { document: { createElement: undefined }}
    chai.expect(canUseDOM()).to.not.be.ok
  })

  it('should be able to use dom when there is function to create element', () => {
    global.window = { document: { createElement: () => {} }}
    chai.expect(canUseDOM()).to.be.ok
  })

  it('should cache whther dom is available', () => {
    global.window = undefined
    const cached = Common.canUseDOM()
    global.window = { document: { createElement: () => {} }}
    chai.expect(Common.canUseDOM()).to.equal(cached)
  })

  it('should not be in react-native when there is no window', () => {
    global.window = undefined
    chai.expect(isReactNative()).to.not.be.ok
  })

  it('should not be in react-native when there is no navigator', () => {
    global.window = { navigator: undefined }
    chai.expect(isReactNative()).to.not.be.ok
  })

  it('should not be in react-native when there is no product name', () => {
    global.window = { navigator: { product: undefined } }
    chai.expect(isReactNative()).to.not.be.ok
  })

  it('should be in react-native when the product name is specified', () => {
    global.window = { navigator: { product: 'ReactNative' } }
    chai.expect(isReactNative()).to.be.ok
  })

  it('should generate an object of constants', () => {
    const storeNames = Common.createObjOfConsts(['TIMETRAVEL'])
    chai.expect(storeNames).to.eql({
      TIMETRAVEL: 'BDUXTT_TIMETRAVEL'
    })
  })

  it('should clear console', () => {
    sandbox.stub(console, 'log')
    consoleClear()
    chai.expect(console.log.called).to.be.true
    chai.expect(console.log.lastCall.args[0]).to.match(/^\s+$/)
  })

  it('should create an instance with a factory function', () => {
    const instance = Common.createInstance(() => 'test')
    chai.expect(instance.get()).to.equal('test')
  })

  it('should reload an instance with a factory function', () => {
    const callback = sinon.stub()
    const instance = Common.createInstance(callback)
    instance.reload()
    chai.expect(callback.calledTwice).to.be.true
  })

  it('should get time from date object', () => {
    Date.now = null
    chai.expect(getTimeFunc()).to.be.a('function')
    chai.expect(getTimeFunc()()).to.be.a('number')
  })

  afterEach(() => {
    sandbox.restore()
  })

})
