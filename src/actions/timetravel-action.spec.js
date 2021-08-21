/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as Bacon from 'baconjs'
import Common from '../utils/common-util'
import Storage from '../utils/storage-util'
import Browser from '../utils/browser-util'
import ActionTypes from '../actions/action-types'
import StoreNames from '../stores/store-names'
import {
  historyInStorageStream,
  historyProperty,
  disableResume,
  start,
  startOnce,
  record,
  resume,
  restart,
  revert,
  clutch,
  declutch,
  toggleHistory } from './timetravel-action'

describe('TimeTravel Action', () => {

  let sandbox, clock

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    clock = sinon.useFakeTimers(Date.now())
  })

  describe('on server', () => {

    beforeEach(() => {
      sandbox.stub(Common, 'isOnClient').returns(false)
    })

    it('should not start creating actions when history changes', () => {
      chai.expect(start()).to.be.false
    })

    it('should not create a resume action', () => {
      chai.expect(resume()).to.be.false
    })

  })

  describe('in browser', () => {

    let promiseLoad
    let promiseRemove

    beforeEach(() => {
      sandbox.stub(Common, 'isOnClient').returns(true)
      sandbox.stub(Storage, 'load')
        .returns(new Promise(resolves => promiseLoad = { resolves }))
      sandbox.stub(Storage, 'remove')
        .returns(new Promise(resolves => promiseRemove = { resolves }))
      sandbox.stub(Storage, 'save').resolvesArg(1)
      historyInStorageStream.reload()
      historyProperty.reload()
    })

    it('should start creating actions when history changes', () => {
      chai.expect(start()).to.be.instanceof(Bacon.Observable)
    })

    it('should start only once', () => {
      startOnce()
      chai.expect(startOnce()).to.not.be.ok
    })

    it('should start without a default action', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not start with null from storage', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves(null)
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not start with an empty array from storage', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves([])
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should start with a non-empty array from storage', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves([{}])
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.firstCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_HISTORY,
        history: [{}],
        skipLog: true
      })
      dispose()
    })

    it('should start declutched with a non-empty array from storage', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves([{}])
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_DECLUTCH,
        skipLog: true
      })
      dispose()
    })

    it('should clear history to restart', async () => {
      const callback = sinon.stub()
      const disposeStart = start().onValue(callback)
      await promiseLoad.resolves([{}])
      const disposeRestart = restart().onValue()
      await promiseRemove.resolves()
      chai.expect(callback.calledThrice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_HISTORY,
        history: [],
        skipLog: true
      })
      disposeStart()
      disposeRestart()
    })

    it('should reload browser to restart', async () => {
      sandbox.stub(Browser, 'reload')
      const dispose = restart().onValue()
      await promiseRemove.resolves()
      chai.expect(Browser.reload.called).to.be.true
      dispose()
    })

    it('should clear console to restart', async () => {
      sandbox.stub(Common, 'consoleClear')
      const dispose = restart().onValue()
      await promiseRemove.resolves()
      chai.expect(Common.consoleClear.called).to.be.true
      dispose()
    })

    it('should create a revert action to restart', async () => {
      const callback = sinon.stub()
      const dispose = restart().onValue(callback)
      await promiseRemove.resolves()
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.firstCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_REVERT,
        timeslice: undefined,
        skipLog: true
      })
      dispose()
    })

    it('should clutch by default after restart', async () => {
      const callback = sinon.stub()
      const dispose = restart().onValue(callback)
      await promiseRemove.resolves()
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_CLUTCH,
        skipLog: true
      })
      dispose()
    })

    it('should not record time travel toggle action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_TOGGLE_HISTORY }}
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not record time travel histoy action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_HISTORY }}
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not record time travel revert action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_REVERT }}
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not record time travel declutch action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_DECLUTCH }}
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not record time travel clutch action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_CLUTCH }}
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not record time travel idle action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_IDLE }}
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not record time travel related store', () => {
      const timeslice = { name: StoreNames.TIMETRAVEL}
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should record an action', () => {
      const action = { type: 'test' }
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      chai.expect(record({ action })).to.not.be.ok
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.nested.property('[0].action')
        .and.eql(action)
      dispose()
    })

    it('should record store states for a single action', () => {
      const action = { id: 1, type: 'test' }
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      record({ action, state: 2 })
      record({ action, state: 3 })
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(1)
        .and.has.nested.property('[0].records')
        .and.eql([
          { action, state: 2 },
          { action, state: 3 }
        ])
      dispose()
    })

    it('should record store states for multiple actions', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      record({ action: { id: 1, type: 'test' }, state: 3 })
      record({ action: { id: 2, type: 'test' }, state: 4 })
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.nested.property('[1].records[0]')
        .and.has.property('state', 4)
      dispose()
    })

    it('should concat record to an existing time slice', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      record({ action: { id: 1 }, state: 3 })
      record({ action: { id: 2 }, state: 4 })
      record({ action: { id: 1 }, other: 5 })
      chai.expect(callback.callCount).to.equal(3)
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.nested.property('[0].records[1]')
        .and.has.property('other', 5)
      dispose()
    })

    it('should record store states after the anchor', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      record({ action: { id: 1 }, state: 4 })
      record({ action: { id: 2 }, state: 5 })
      revert(callback.lastCall.args[0].history[0].id)
      record({ action: { id: 3 }, state: 6 })
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.nested.property('[1].records[0]')
        .and.has.property('state', 6)
      dispose()
    })

    it('should record store states after the anchor', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      record({ action: { id: 1 }, state: 4 })
      record({ action: { id: 2 }, state: 5 })
      revert(callback.lastCall.args[0].history[0].id)
      record({ action: { id: 3 }, state: 6 })
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.nested.property('[1].records[0]')
        .and.has.property('state', 6)
      dispose()
    })

    it('should set anchor to revert', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      record({ action: { id: 1 }, state: 2 })
      revert(callback.lastCall.args[0].history[0].id)
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(1)
        .and.has.nested.property('[0].anchor', true)
      dispose()
    })

    it('should reset anchor after the next recording', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      record({ action: { id: 1 }, state: 3 })
      revert(callback.lastCall.args[0].history[0].id)
      record({ action: { id: 2 }, state: 4 })
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.nested.property('[0].anchor', false)
      dispose()
    })

    it('should ignore reverting back to unknown id', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      record({ action: { id: 1 }, state: 2 })
      revert('unknown')
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(1)
        .and.has.nested.property('[0].anchor', false)
      dispose()
    })

    it('should ignore reverting with an empty history', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      revert('unknown')
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(0)
      dispose()
    })

    it('should create a revert action', () => {
      const callback = sinon.stub()
      revert('unknown').onValue(callback)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_REVERT,
        timeslice: undefined,
        skipLog: true
      })
    })

    it('should create a revert action with a timeslice', () => {
      const callbackStart = sinon.stub()
      const dispose = start().onValue(callbackStart)
      record({ action: { id: 1 } })

      const callbackRevert = sinon.stub()
      const history = callbackStart.lastCall.args[0].history;
      revert(history[0].id).onValue(callbackRevert)
      chai.expect(callbackRevert.calledOnce).to.be.true
      chai.expect(callbackRevert.lastCall.args[0]).to.have.property('timeslice')
        .and.has.nested.property('action.id', 1)
      dispose()
    })

    it('should enable resume after reverting', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves([])
      revert('unknown')
      callback.reset()

      resume()
      clock.tick(1)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('type')
        .to.equal(ActionTypes.TIMETRAVEL_REVERT)
      dispose()
    })

    it('should disable resume', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves([{}])
      disableResume()
      callback.reset()

      resume()
      clock.tick(1)
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should save history in storage', () => {
      const dispose = start().onValue()
      record({ action: { id: 1 } })
      clock.tick(500)
      chai.expect(Storage.save.callCount).to.equal(1)
      chai.expect(Storage.save.lastCall.args[1]).to.have.length(1)
        .and.has.nested.property('[0].action.id', 1)
      dispose()
    })

    it('should debounce history saving into storage', () => {
      const dispose = start().onValue()
      record({ action: { id: 1 } })
      record({ action: { id: 2 } })
      chai.expect(Storage.save.called).to.be.false
      clock.tick(500)
      chai.expect(Storage.save.callCount).to.equal(1)
      dispose()
    })

    it('should replace history after save fallback', (done) => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      Storage.save.callsFake(() => Promise.resolve([]))
      record({ action: { id: 1 } })
      clock.tick(500)
      clock.restore()
      setTimeout(() => {
        chai.expect(callback.callCount).to.equal(2)
        chai.expect(callback.lastCall.args[0]).to.have.property('history')
          .and.eql([])
        dispose()
        done()
      }, 0)
    })

    it('should not resume without history from storage', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves(undefined)
      resume()
      clock.tick(1)
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not resume with an empty array from storage', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves([])
      resume()
      clock.tick(1)
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should not resume before loading history from storage', () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      resume()
      clock.tick(1)
      chai.expect(callback.called).to.be.false
      dispose()
    })

    it('should create a resume action', async () => {
      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves([{}])
      callback.reset()

      resume()
      chai.expect(callback.called).to.be.false

      clock.tick(1)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_REVERT,
        timeslice: {},
        skipLog: true
      })
      dispose()
    })

    it('should resume from the anchor', async () => {
      const history = [
        { action: { id: 1 }, anchor: true },
        { action: { id: 2 } }
      ]

      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves(history)
      resume()
      clock.tick(1)
      chai.expect(callback.calledThrice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('timeslice')
        .and.has.nested.property('action.id', 1)
      dispose()
    })

    it('should resume from the end of history', async () => {
      const history = [
        { action: { id: 1 } },
        { action: { id: 2 } }
      ]

      const callback = sinon.stub()
      const dispose = start().onValue(callback)
      await promiseLoad.resolves(history)
      resume()
      clock.tick(1)
      chai.expect(callback.calledThrice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('timeslice')
        .and.has.nested.property('action.id', 2)
      dispose()
    })

    it('should create a clutch action', () => {
      chai.expect(clutch()).to.eql({
        type: ActionTypes.TIMETRAVEL_CLUTCH,
        skipLog: true
      })
    })

    it('should create a declutch action', () => {
      chai.expect(declutch()).to.eql({
        type: ActionTypes.TIMETRAVEL_DECLUTCH,
        skipLog: true
      })
    })

    it('should toggle history panel open and close', () => {
      chai.expect(toggleHistory()).to.eql({
        type: ActionTypes.TIMETRAVEL_TOGGLE_HISTORY,
        skipLog: true
      })
    })

  })

  afterEach(() => {
    clock.restore()
    sandbox.restore()
  })

})
