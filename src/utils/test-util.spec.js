/* eslint-env mocha, node */

import chai from 'chai'
import sinon from 'sinon'
import module from 'module'
import {
  requireIOS,
  requireAndroid } from './test-util'

describe('Test Utilities', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  it('should hijack module findPath to ios', () => {
    requireIOS(sandbox, ['./test-util'])
    chai.expect(module._findPath('./test-util', [__dirname]))
      .to.match(/test-util\.ios\.js$/)
  })

  it('should hijack module findPath to android', () => {
    requireAndroid(sandbox, ['./test-util'])
    chai.expect(module._findPath('./test-util', [__dirname]))
      .to.match(/test-util\.android\.js$/)
  })

  it('should not hijack module findPath', () => {
    chai.expect(module._findPath('./test-util', [__dirname]))
      .to.match(/test-util\.js$/)
  })

  it('should handle unknown filepath', () => {
    requireIOS(sandbox, ['./test-util'])
    chai.expect(module._findPath('./unknown', [__dirname]))
      .to.be.false
  })

  it('should ignore path', () => {
    requireIOS(sandbox, ['test-util'])
    chai.expect(module._findPath('./test-util', [__dirname]))
      .to.match(/test-util\.ios\.js$/)
  })

  it('should ignore suffix', () => {
    requireIOS(sandbox, ['test-util.js'])
    chai.expect(module._findPath('./test-util', [__dirname]))
      .to.match(/test-util\.ios\.js$/)
  })

  afterEach(() => {
    sandbox.restore()
  })

})
