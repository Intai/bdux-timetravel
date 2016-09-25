/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Bacon from 'baconjs'
import sinonStubPromise from 'sinon-stub-promise'
import Common from '../utils/common-util'
import Storage from '../utils/storage-util'
import Browser from '../utils/browser-util'
import ActionTypes from '../actions/action-types'
import StoreNames from '../stores/store-names'
import TimeTravelAction, {
  historyInStorageStream,
  historyProperty,
  start,
  record,
  resume,
  restart,
  revert,
  clutch,
  declutch,
  toggleHistory } from './timetravel-action'

sinonStubPromise(sinon)

describe('TimeTravel Action', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
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
      promiseLoad = sandbox.stub(Storage, 'load').returnsPromise()
      promiseRemove = sandbox.stub(Storage, 'remove').returnsPromise()
      sandbox.stub(Storage, 'save').returns(sinon.stub())
      historyInStorageStream.reload()
      historyProperty.reload()
    })

    it('should start creating actions when history changes', () => {
      chai.expect(start()).to.be.instanceof(Bacon.Observable)
    })

    it('should start only once', () => {
      TimeTravelAction.start()
      chai.expect(TimeTravelAction.start()).to.not.be.ok
    })

    it('should start without a default action', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(callback.called).to.be.false
    })

    it('should not start with null from storage', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      promiseLoad.resolves(null)
      chai.expect(callback.called).to.be.false
    })

    it('should not start with an empty array from storage', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      promiseLoad.resolves([])
      chai.expect(callback.called).to.be.false
    })

    it('should start with a non-empty array from storage', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      promiseLoad.resolves([{}])
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_HISTORY,
        history: [{}],
        skipLog: true
      })
    })

    it('should clear history to restart', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      promiseLoad.resolves([{}])
      restart().onValue()
      promiseRemove.resolves()
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_HISTORY,
        history: [],
        skipLog: true
      })
    })

    it('should reload browser to restart', () => {
      sandbox.stub(Browser, 'reload')
      restart().onValue()
      promiseRemove.resolves()
      chai.expect(Browser.reload.called).to.be.true
    })

    it('should clear console to restart', () => {
      sandbox.stub(Common, 'consoleClear')
      restart().onValue()
      promiseRemove.resolves()
      chai.expect(Common.consoleClear.called).to.be.true
    })

    it('should create a revert action to restart', () => {
      const callback = sinon.stub()
      restart().onValue(callback)
      promiseRemove.resolves()
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.firstCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_REVERT,
        timeslice: undefined,
        skipLog: true
      })
    })

    it('should clutch by default after restart', () => {
      const callback = sinon.stub()
      restart().onValue(callback)
      promiseRemove.resolves()
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_CLUTCH,
        skipLog: true
      })
    })

    it('should not record time travel toggle action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_TOGGLE_HISTORY }}
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
    })

    it('should not record time travel histoy action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_HISTORY }}
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
    })

    it('should not record time travel revert action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_REVERT }}
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
    })

    it('should not record time travel declutch action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_DECLUTCH }}
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
    })

    it('should not record time travel clutch action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_CLUTCH }}
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
    })

    it('should not record time travel idle action', () => {
      const timeslice = { action: { type: ActionTypes.TIMETRAVEL_IDLE }}
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
    })

    it('should not record time travel related store', () => {
      const timeslice = { name: StoreNames.TIMETRAVEL}
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(record(timeslice)).to.be.false
      chai.expect(callback.called).to.be.false
    })

    it('should record an action', () => {
      const action = { type: 'test' }
      const callback = sinon.stub()
      start().onValue(callback)
      chai.expect(record({ action })).to.not.be.ok
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.deep.property('[0].action')
        .and.eql(action)
    })

    it('should record store states for a single action', () => {
      const action = { id: 1, type: 'test' }
      const callback = sinon.stub()
      start().onValue(callback)
      record({ action, state: 2 })
      record({ action, state: 3 })
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(1)
        .and.has.deep.property('[0].records')
        .and.eql([
          { action, state: 2 },
          { action, state: 3 }
        ])
    })

    it('should record store states for multiple actions', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      record({ action: { id: 1, type: 'test' }, state: 3 })
      record({ action: { id: 2, type: 'test' }, state: 4 })
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.deep.property('[1].records[0]')
        .and.has.property('state', 4)
    })

    it('should record store states after the anchor', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      record({ action: { id: 1 }, state: 4 })
      record({ action: { id: 2 }, state: 5 })
      revert(callback.lastCall.args[0].history[0].id)
      record({ action: { id: 3 }, state: 6 })
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.deep.property('[1].records[0]')
        .and.has.property('state', 6)
    })

    it('should record store states after the anchor', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      record({ action: { id: 1 }, state: 4 })
      record({ action: { id: 2 }, state: 5 })
      revert(callback.lastCall.args[0].history[0].id)
      record({ action: { id: 3 }, state: 6 })
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.deep.property('[1].records[0]')
        .and.has.property('state', 6)
    })

    it('should set anchor to revert', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      record({ action: { id: 1 }, state: 2 })
      revert(callback.lastCall.args[0].history[0].id)
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(1)
        .and.has.deep.property('[0].anchor', true)
    })

    it('should reset anchor after the next recording', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      record({ action: { id: 1 }, state: 3 })
      revert(callback.lastCall.args[0].history[0].id)
      record({ action: { id: 2 }, state: 4 })
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(2)
        .and.has.deep.property('[0].anchor', false)
    })

    it('should ignore reverting back to unknown id', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      record({ action: { id: 1 }, state: 2 })
      revert('unknown')
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(1)
        .and.has.deep.property('[0].anchor', false)
    })

    it('should ignore reverting with an empty history', () => {
      const callback = sinon.stub()
      start().onValue(callback)
      revert('unknown')
      chai.expect(callback.called).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('history')
        .and.has.length(0)
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
      start().onValue(callbackStart)
      record({ action: { id: 1 } })

      const callbackRevert = sinon.stub()
      const history = callbackStart.lastCall.args[0].history;
      revert(history[0].id).onValue(callbackRevert)
      chai.expect(callbackRevert.calledOnce).to.be.true
      chai.expect(callbackRevert.lastCall.args[0]).to.have.property('timeslice')
        .and.has.deep.property('action.id', 1)
    })

    it('should save history in storage', () => {
      start().onValue()
      record({ action: { id: 1 } })
      chai.expect(Storage.save().calledTwice).to.be.true
      chai.expect(Storage.save().lastCall.args[0]).to.have.length(1)
        .and.has.deep.property('[0].action.id', 1)
    })

    it('should create a resume action', () => {
      const callback = sinon.stub()
      resume().onValue(callback)
      promiseLoad.resolves(undefined)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_REVERT,
        timeslice: undefined,
        skipLog: true
      })
    })

    it('should resume from the anchor', () => {
      const history = [
        { action: { id: 1 }, anchor: true },
        { action: { id: 2 } }
      ]

      const callback = sinon.stub()
      resume().onValue(callback)
      promiseLoad.resolves(history)
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.firstCall.args[0]).to.have.property('timeslice')
        .and.has.deep.property('action.id', 1)
    })

    it('should resume from the end of history', () => {
      const history = [
        { action: { id: 1 } },
        { action: { id: 2 } }
      ]

      const callback = sinon.stub()
      resume().onValue(callback)
      promiseLoad.resolves(history)
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.firstCall.args[0]).to.have.property('timeslice')
        .and.has.deep.property('action.id', 2)
    })

    it('should declutch after resuming', () => {
      const callback = sinon.stub()
      resume().onValue(callback)
      promiseLoad.resolves([{}])
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({
        type: ActionTypes.TIMETRAVEL_DECLUTCH,
        skipLog: true
      })
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
    sandbox.restore()
  })

})