/* eslint-env mocha */

import * as R from 'ramda'
import chai from 'chai'
import sinon from 'sinon'
import Bacon from 'baconjs'
import { getActionStream } from 'bdux'
import ActionTypes from '../actions/action-types'
import TimeTravelStore, {
  getReducer } from './timetravel-store'

describe('TimeTravel Store', () => {

  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now())
  })

  it('should have reducer input', () => {
    chai.expect(getReducer()).to.have.property('input')
      .and.is.instanceof(Bacon.Observable)
  })

  it('should have reducer output', () => {
    chai.expect(getReducer()).to.have.property('output')
      .and.is.instanceof(Bacon.Observable)
  })

  it('should have empty history by default', () => {
    const callback = sinon.stub()
    const reducer = getReducer()
    reducer.output.onValue(callback)
    reducer.input.push({})
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('history')
      .and.eql([])
  })

  it('should be declutched by default', () => {
    const callback = sinon.stub()
    const reducer = getReducer()
    reducer.output.onValue(callback)
    reducer.input.push({})
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('declutch')
      .and.is.false
  })

  it('should record history', () => {
    const callback = sinon.stub()
    TimeTravelStore.getProperty().onValue(callback)
    getActionStream().push({
      type: ActionTypes.TIMETRAVEL_HISTORY,
      history: R.repeat({}, 2)
    })

    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('history')
      .and.have.length(2)
  })

  it('should keep the anchor in history', () => {
    const callback = sinon.stub()
    TimeTravelStore.getProperty().onValue(callback)
    getActionStream().push({
      type: ActionTypes.TIMETRAVEL_HISTORY,
      history: [{ anchor: true }, {}]
    })

    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('history')
      .and.satisfy(R.pipe(R.head, R.prop('anchor')))
      .and.satisfy(R.pipe(R.last, R.prop('anchor'), R.not))
  })

  it('should anchor at the last record in history', () => {
    const callback = sinon.stub()
    TimeTravelStore.getProperty().onValue(callback)
    getActionStream().push({
      type: ActionTypes.TIMETRAVEL_HISTORY,
      history: R.repeat({ anchor: false }, 2)
    })

    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.nested.property('history[1]')
      .and.include({ anchor: true, isLast: true })
  })

  it('should remember declutch in the store', () => {
    const callback = sinon.stub()
    TimeTravelStore.getProperty().onValue(callback)
    getActionStream().push({
      type: ActionTypes.TIMETRAVEL_DECLUTCH
    })

    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('declutch')
      .and.is.true
  })

  it('should remember being clutched', () => {
    const callback = sinon.stub()
    TimeTravelStore.getProperty().onValue(callback)
    getActionStream().push({
      type: ActionTypes.TIMETRAVEL_CLUTCH
    })

    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('declutch')
      .and.is.false
  })

  it('should toggle to hide history', () => {
    const callback = sinon.stub()
    TimeTravelStore.getProperty().onValue(callback)
    getActionStream().plug(Bacon.fromArray(
      R.repeat({
        type: ActionTypes.TIMETRAVEL_TOGGLE_HISTORY
      }, 2)
    ))

    clock.tick(1)
    chai.expect(callback.calledThrice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('showHistory')
      .and.is.false
  })

  it('should show history', () => {
    const callback = sinon.stub()
    TimeTravelStore.getProperty().onValue(callback)
    getActionStream().push({
      type: ActionTypes.TIMETRAVEL_TOGGLE_HISTORY
    })

    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('showHistory')
      .and.is.true
  })

  afterEach(() => {
    clock.restore()
  })

})
