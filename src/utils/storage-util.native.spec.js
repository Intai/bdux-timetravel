/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import 'react-native-mock-render/mock'
import { AsyncStorage } from 'react-native'
import sinonStubPromise from 'sinon-stub-promise'
import Storage from './storage-util.native'

sinonStubPromise(sinon)

describe('Storage Utilities for react-native', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  it('should return a promise to save', () => {
    chai.expect(Storage.save('name', [])).to.be.instanceof(Promise)
  })

  it('should return a promise to load', () => {
    chai.expect(Storage.load()).to.be.instanceof(Promise)
  })

  it('should return a promise to remove', () => {
    chai.expect(Storage.remove()).to.be.instanceof(Promise)
  })

  it('should save to async storage', () => {
    sandbox.stub(AsyncStorage, 'setItem')
    Storage.save('name', [])
    chai.expect(AsyncStorage.setItem.calledOnce).to.be.true
    chai.expect(AsyncStorage.setItem.lastCall.args).to.eql(['name', '[]'])
  })

  it('should load from async storage', () => {
    sandbox.stub(AsyncStorage, 'getItem').returnsPromise()
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
