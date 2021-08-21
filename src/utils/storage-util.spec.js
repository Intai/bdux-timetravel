/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import { tail } from 'ramda'
import {
  save,
  load,
  remove,
  noop,
} from './storage-util'

describe('Storage Utilities', () => {

  beforeEach(() => {
    global.window = {
      sessionStorage: {
        setItem: sinon.stub(),
        getItem: sinon.stub().returns('[]'),
        removeItem: sinon.stub()
      }
    }
  })

  it('should return a promise to save', () => {
    chai.expect(save()).to.be.instanceof(Promise)
  })

  it('should return a promise to load', () => {
    chai.expect(load()).to.be.instanceof(Promise)
  })

  it('should return a promise to remove', () => {
    chai.expect(remove()).to.be.instanceof(Promise)
  })

  it('should save to session storage', () => {
    const setItem = window.sessionStorage.setItem
    save('name', [])
    chai.expect(setItem.calledOnce).to.be.true
    chai.expect(setItem.lastCall.args).to.eql(['name', '[]'])
  })

  it('should load from session storage', () => {
    const getItem = window.sessionStorage.getItem
    load('name')
    chai.expect(getItem.calledOnce).to.be.true
    chai.expect(getItem.lastCall.args[0]).to.eql('name')
  })

  it('should resolve promise to load', (done) => {
    const callback = sinon.stub()
    load('name').then(callback)
    setTimeout(() => {
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql([])
      done()
    }, 0)
  })

  it('should remove from session storage', () => {
    const removeItem = window.sessionStorage.removeItem
    remove('name')
    chai.expect(removeItem.calledOnce).to.be.true
    chai.expect(removeItem.lastCall.args[0]).to.eql('name')
  })

  it('should still return a promise on server', () => {
    chai.expect(noop()).to.be.instanceof(Promise)
  })

  it('should fallback if failed to save', () => {
    const setItem = window.sessionStorage.setItem
    setItem.onFirstCall().throws()
    save('name', [1, 2], tail)
    chai.expect(setItem.callCount).to.equal(2)
    chai.expect(setItem.lastCall.args).to.eql(['name', '[2]'])
  })

  it('should fallback maximum 4 times when saving', () => {
    const setItem = window.sessionStorage.setItem
    setItem.throws()
    save('name', [1, 2, 3, 4, 5], tail)
    chai.expect(setItem.callCount).to.equal(5)
    chai.expect(setItem.lastCall.args).to.eql(['name', '[5]'])
  })

  it('should resolve promise after save fallback', (done) => {
    const callback = sinon.stub()
    const setItem = window.sessionStorage.setItem
    setItem.onFirstCall().throws()
    setItem.onSecondCall().throws()
    save('name', [1, 2, 3], tail).then(callback)
    setTimeout(() => {
      chai.expect(callback.callCount).to.equal(1)
      chai.expect(callback.lastCall.args[0]).to.eql([3])
      done()
    }, 0)
  })

  it('should not throw if failed to save', () => {
    const setItem = window.sessionStorage.setItem
    setItem.onFirstCall().throws()
    chai.expect(() => save('name', [])).to.not.throw()
  })

})
