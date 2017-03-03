/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import sinonStubPromise from 'sinon-stub-promise'
import Common from './utils/common-util'
import Storage from './utils/storage-util'
import ActionTypes from './actions/action-types'
import TimeTravelAction from './actions/timetravel-action'
import * as TimeTravel from './timetravel'

sinonStubPromise(sinon)

describe('TimeTravel Middleware', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  it('should apply middleware before reducer', () => {
    chai.expect(TimeTravel).to.have.property('getPreReduce')
      .and.is.a('function')
  })

  it('should not apply middleware after reducer', () => {
    chai.expect(TimeTravel).to.not.have.property('getPostReduce')
  })

  describe('on server', () => {

    beforeEach(() => {
      sandbox.stub(Common, 'isOnClient').returns(false)
    })

    it('should be transparent before reducer', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const value = {}

      pluggable.output.onValue(callback)
      pluggable.input.push(value)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.equal(value)
    })

    it('should not record action and store states', () => {
      sandbox.stub(TimeTravelAction, 'record')
      const pluggable = TimeTravel.getPreReduce()
      pluggable.output.onValue()
      pluggable.input.push({})
      chai.expect(TimeTravelAction.record.called).to.be.false
    })

  })

  describe('in browser', () => {

    let promiseLoad

    beforeEach(() => {
      sandbox.stub(Common, 'isOnClient').returns(true)
      promiseLoad = sandbox.stub(Storage, 'load').returnsPromise()
      TimeTravel.historyInStorageProperty.reload()
    })

    it('should start recording', () => {
      sandbox.stub(TimeTravelAction, 'start')
      TimeTravel.getPreReduce()
      chai.expect(TimeTravelAction.start.calledOnce).to.be.true
    })

    it('should record action and store states', () => {
      sandbox.stub(TimeTravelAction, 'record')
      const pluggable = TimeTravel.getPreReduce()
      const value = {
        action: {}
      }

      pluggable.output.onValue()
      pluggable.input.push(value)
      promiseLoad.resolves([])
      chai.expect(TimeTravelAction.record.calledOnce).to.be.true
      chai.expect(TimeTravelAction.record.lastCall.args[0]).to.eql(value)
    })

    it('should hold before history is loaded from storage', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()

      pluggable.output.onValue(callback)
      pluggable.input.push({})
      promiseLoad.rejects()
      chai.expect(callback.called).to.be.false
    })

    it('should continue after history is loaded from storage', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()

      pluggable.output.onValue(callback)
      pluggable.input.push({})
      promiseLoad.resolves([])
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({})
    })

    it('should keep the latest loaded history from storage', () => {
      const pluggable1 = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      pluggable1.output.onValue(callback)
      pluggable1.input.push({})
      promiseLoad.resolves([])

      const pluggable2 = TimeTravel.getPreReduce()
      pluggable2.output.onValue(callback)
      pluggable2.input.push({ name: 'test' })
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({ name: 'test' })
    })

    it('should declutch by default when resuming from storage', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()

      pluggable.output.onValue(callback)
      pluggable.input.push({})
      promiseLoad.resolves([{}])
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_IDLE)
    })

    it('should skip logging action which has been blocked', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push({})
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('skipLog', true)
    })

    it('should clutch to send action through', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const clutch = {
        action: {
          type: ActionTypes.TIMETRAVEL_CLUTCH
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(clutch)
      pluggable.input.push({})
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.eql({})
    })

    it('should declutch to block action from flowing through', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const declutch = {
        action: {
          type: ActionTypes.TIMETRAVEL_DECLUTCH
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([])
      pluggable.input.push(declutch)
      pluggable.input.push({})
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_IDLE)
    })

    it('should not block timetravel toggle action', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const toggle = {
        action: {
          type: ActionTypes.TIMETRAVEL_TOGGLE_HISTORY
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(toggle)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_TOGGLE_HISTORY)
    })

    it('should not block timetravel history action', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const history = {
        action: {
          type: ActionTypes.TIMETRAVEL_HISTORY
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(history)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_HISTORY)
    })

    it('should not block timetravel revert action', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const revert = {
        action: {
          type: ActionTypes.TIMETRAVEL_REVERT
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(revert)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_REVERT)
    })

    it('should not block timetravel declutch action', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const declutch = {
        action: {
          type: ActionTypes.TIMETRAVEL_DECLUTCH
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(declutch)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_DECLUTCH)
    })

    it('should not block timetravel clutch action', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const clutch = {
        action: {
          type: ActionTypes.TIMETRAVEL_CLUTCH
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(clutch)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_CLUTCH)
    })

    it('should revert back to a timeslice', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const revert = {
        name: 'store',
        action: {
          type: ActionTypes.TIMETRAVEL_REVERT,
          timeslice: {
            records: [{
              name: 'store',
              state: 'data'
            }]
          }
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(revert)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('state')
        .and.equal('data')
    })

    it('should revert state back to null for unknown store', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const revert = {
        name: 'store',
        action: {
          type: ActionTypes.TIMETRAVEL_REVERT,
          timeslice: {
            records: [{
              name: 'other',
              state: 'data'
            }]
          }
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(revert)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('state')
        .and.is.null
    })

    it('should revert state back to null for missing time records', () => {
      const pluggable = TimeTravel.getPreReduce()
      const callback = sinon.stub()
      const revert = {
        name: 'store',
        action: {
          type: ActionTypes.TIMETRAVEL_REVERT,
          timeslice: {}
        }
      }

      pluggable.output.onValue(callback)
      promiseLoad.resolves([{}])
      pluggable.input.push(revert)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('state')
        .and.is.null
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
