/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as R from 'ramda'
import Common from './utils/common-util'
import Storage from './utils/storage-util'
import ActionTypes from './actions/action-types'
import * as TimeTravelAction from './actions/timetravel-action'
import * as TimeTravel from './timetravel'

const removeReserved = R.omit(
  ['dispatch']
)

describe('TimeTravel Middleware', () => {

  let sandbox, params

  const createActionType = (type) => ({
    ...params,
    action: { type }
  })

  const createParams = (additional) => ({
    ...params,
    ...additional
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    params = { dispatch: sinon.stub() }
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
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const value = createParams({})

      pluggable.output.onValue(callback)
      pluggable.input.push(value)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.equal(value)
    })

    it('should not record action and store states', () => {
      sandbox.stub(TimeTravelAction, 'record')
      const pluggable = TimeTravel.getPreReduce(params)
      pluggable.output.onValue()
      pluggable.input.push(params)
      chai.expect(TimeTravelAction.record.called).to.be.false
    })

  })

  describe('in browser', () => {

    let promiseLoad

    beforeEach(() => {
      sandbox.stub(Common, 'isOnClient').returns(true)
      sandbox.stub(Storage, 'load')
        .returns(new Promise((resolves, rejects) => promiseLoad = { resolves, rejects }))
      TimeTravel.historyInStorageProperty.reload()
      TimeTravel.declutchProperty.reload()
    })

    it('should start recording', () => {
      sandbox.stub(TimeTravelAction, 'startOnce')
      TimeTravel.getPreReduce(params)
      chai.expect(TimeTravelAction.startOnce.calledOnce).to.be.true
    })

    it('should not disable resume', async () => {
      sandbox.stub(TimeTravelAction, 'disableResume')
      const pluggable = TimeTravel.getPreReduce(params)

      pluggable.output.onValue()
      pluggable.input.push(params)
      await promiseLoad.resolves([])
      chai.expect(TimeTravelAction.disableResume.called).to.be.false
    })

    it('should not disable resume when updating history', async () => {
      sandbox.stub(TimeTravelAction, 'disableResume')
      const pluggable = TimeTravel.getPreReduce(params)
      const revert = createActionType(ActionTypes.TIMETRAVEL_REVERT)
      const history = createActionType(ActionTypes.TIMETRAVEL_HISTORY)

      pluggable.output.onValue()
      pluggable.input.push(revert)
      pluggable.input.push(history)
      await promiseLoad.resolves([])
      chai.expect(TimeTravelAction.disableResume.called).to.be.false
    })

    it('should disable resume after reverting', async () => {
      sandbox.stub(TimeTravelAction, 'disableResume')
      const pluggable = TimeTravel.getPreReduce(params)
      const revert = createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_REVERT
        }
      })

      pluggable.output.onValue()
      pluggable.input.push(revert)
      pluggable.input.push(params)
      await promiseLoad.resolves([])
      chai.expect(TimeTravelAction.disableResume.calledOnce).to.be.true
    })

    it('should record action and store states', async () => {
      sandbox.stub(TimeTravelAction, 'record')
      const pluggable = TimeTravel.getPreReduce(params)
      const value = createParams({
        action: {}
      })

      pluggable.output.onValue()
      pluggable.input.push(value)
      await promiseLoad.resolves([])
      chai.expect(TimeTravelAction.record.calledOnce).to.be.true
      chai.expect(removeReserved(TimeTravelAction.record.lastCall.args[0])).to.eql({
        action: {}
      })
    })

    it('should hold before history is loaded from storage', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()

      pluggable.output.onValue(callback)
      pluggable.input.push(params)
      await promiseLoad.rejects()
      chai.expect(callback.called).to.be.false
    })

    it('should continue after history is loaded from storage', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()

      pluggable.output.onValue(callback)
      pluggable.input.push(params)
      await promiseLoad.resolves([])
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(removeReserved(callback.lastCall.args[0])).to.eql({})
    })

    it('should keep the latest loaded history from storage', async () => {
      const pluggable1 = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      pluggable1.output.onValue(callback)
      pluggable1.input.push(params)
      await promiseLoad.resolves([])

      const pluggable2 = TimeTravel.getPreReduce(params)
      pluggable2.output.onValue(callback)
      pluggable2.input.push(createParams({ name: 'test' }))
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(removeReserved(callback.lastCall.args[0])).to.eql({ name: 'test' })
    })

    it('should declutch by default when resuming from storage', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()

      pluggable.output.onValue(callback)
      pluggable.input.push(params)
      await promiseLoad.resolves([{}])
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_IDLE)
    })

    it('should keep whether currently declutched', async () => {
      const pluggable1 = TimeTravel.getPreReduce(params)
      const callback1 = sinon.stub()
      pluggable1.output.onValue(callback1)
      pluggable1.input.push(params)
      await promiseLoad.resolves([{}])
      pluggable1.input.push(createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_CLUTCH
        }
      }))

      const pluggable2 = TimeTravel.getPreReduce(params)
      const callback2 = sinon.stub()
      pluggable2.output.onValue(callback2)
      pluggable2.input.push(params)
      chai.expect(callback2.calledOnce).to.be.true
      chai.expect(removeReserved(callback2.lastCall.args[0])).to.eql({})
    })

    it('should skip logging action which has been blocked', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(params)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('skipLog', true)
    })

    it('should clutch to send action through', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const clutch = createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_CLUTCH
        }
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(clutch)
      pluggable.input.push(params)
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(removeReserved(callback.lastCall.args[0])).to.eql({})
    })

    it('should declutch to block action from flowing through', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const declutch = createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_DECLUTCH
        }
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([])
      pluggable.input.push(declutch)
      pluggable.input.push(params)
      chai.expect(callback.calledTwice).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_IDLE)
    })

    it('should not block timetravel toggle action', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const toggle = createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_TOGGLE_HISTORY
        }
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(toggle)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_TOGGLE_HISTORY)
    })

    it('should not block timetravel history action', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const history = createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_HISTORY
        }
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(history)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_HISTORY)
    })

    it('should not block timetravel revert action', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const revert = createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_REVERT
        }
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(revert)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_REVERT)
    })

    it('should not block timetravel declutch action', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const declutch = createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_DECLUTCH
        }
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(declutch)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_DECLUTCH)
    })

    it('should not block timetravel clutch action', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const clutch = createParams({
        action: {
          type: ActionTypes.TIMETRAVEL_CLUTCH
        }
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(clutch)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('action')
        .and.has.property('type', ActionTypes.TIMETRAVEL_CLUTCH)
    })

    it('should revert back to a timeslice', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const revert = createParams({
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
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(revert)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('state')
        .and.equal('data')
    })

    it('should revert state back to null for unknown store', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const revert = createParams({
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
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
      pluggable.input.push(revert)
      chai.expect(callback.calledOnce).to.be.true
      chai.expect(callback.lastCall.args[0]).to.have.property('state')
        .and.is.null
    })

    it('should revert state back to null for missing time records', async () => {
      const pluggable = TimeTravel.getPreReduce(params)
      const callback = sinon.stub()
      const revert = createParams({
        name: 'store',
        action: {
          type: ActionTypes.TIMETRAVEL_REVERT,
          timeslice: {}
        }
      })

      pluggable.output.onValue(callback)
      await promiseLoad.resolves([{}])
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
