/* eslint-env jest */

import chai from 'chai'
import sinon from 'sinon'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Storage from './storage-util'

const isPromise = promise => (
  promise
    && typeof promise.then === 'function'
    && promise[Symbol.toStringTag] === 'Promise'
)

describe('Storage Utilities for react-native', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  it('should return a promise to save', () => {
    chai.expect(isPromise(Storage.save('name', []))).to.be.true
  })

  it('should return a promise to load', () => {
    chai.expect(isPromise(Storage.load())).to.be.true
  })

  it('should return a promise to remove', () => {
    chai.expect(isPromise(Storage.remove())).to.be.true
  })

  it('should save to async storage', () => {
    sandbox.stub(AsyncStorage, 'setItem')
    Storage.save('name', [])
    chai.expect(AsyncStorage.setItem.calledOnce).to.be.true
    chai.expect(AsyncStorage.setItem.lastCall.args).to.eql(['name', '[]'])
  })

  it('should load from async storage', () => {
    sandbox.stub(AsyncStorage, 'getItem').returns(Promise.resolve(''))
    Storage.load('name')
    chai.expect(AsyncStorage.getItem.calledOnce).to.be.true
    chai.expect(AsyncStorage.getItem.lastCall.args[0]).to.eql('name')
  })

  it('should resolve promise to load', () => {
    sandbox.stub(AsyncStorage, 'getItem').returns(Promise.resolve('[]'))
    const callback = sinon.stub()
    Storage.load('name').then(callback)
    setTimeout(() => {
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql([])
    }, 0)
  })

  it('should remove from async storage', () => {
    sandbox.stub(AsyncStorage, 'removeItem')
    Storage.remove('name')
    chai.expect(AsyncStorage.removeItem.calledOnce).to.be.true
    chai.expect(AsyncStorage.removeItem.lastCall.args[0]).to.eql('name')
  })

  afterEach(() => {
    sandbox.restore()
  })

})
