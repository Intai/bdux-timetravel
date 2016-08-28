import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { shallow } from 'enzyme'
import { TimeTravel } from './timetravel-react'

describe('TimeTravel Component', () => {

  it('should wrap inside a container', () => {
    const wrapper = shallow(<TimeTravel />)
    chai.expect(wrapper.name()).to.equal('Container')
  })

})
