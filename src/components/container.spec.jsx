/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React, { useMemo } from 'react'
import { JSDOM } from 'jsdom'
import { shallow, mount } from 'enzyme'
import { applyMiddleware, clearMiddlewares } from 'bdux'
import ContainerWithMemo, { Container } from './container'

describe('Container Component', () => {

  it('should be a div element', () => {
    const wrapper = shallow(<Container />)
    chai.expect(wrapper.name()).to.equal('div')
  })

  it('should be able to style color', () => {
    const wrapper = shallow(<Container style={{ color: 'test' }} />)
    chai.expect(wrapper.prop('style')).to.have.property('color', 'test')
  })

  it('should render child text', () => {
    const wrapper = shallow(<Container>Click</Container>)
    chai.expect(wrapper.text()).to.equal('Click')
  })

  it('should render children', () => {
    const wrapper = shallow(<Container><div /><span /></Container>)
    chai.expect(wrapper.childAt(0).type()).to.equal('div')
    chai.expect(wrapper.childAt(1).type()).to.equal('span')
  })

  describe('with jsdom', () => {

    let useHook

    beforeEach(() => {
      const dom = new JSDOM('<html></html>')
      global.window = dom.window
      global.document = dom.window.document
      global.Element = dom.window.Element

      useHook = sinon.stub()
      applyMiddleware({
        useHook
      })
    })

    it('should not render with the same style', () => {
      const Test = (props) => {
        const containerProps = useMemo(() => ({
          style: { margin: props.margin },
          children: <>{props.margin}</>
        }), [props.margin])
        return <ContainerWithMemo {...containerProps} />
      }

      const wrapper = mount(<Test margin="10" />)
      wrapper.setProps({ margin: '10' })
      chai.expect(useHook.callCount).to.equal(1)
    })

    it('should render with a different style', () => {
      const Test = (props) => {
        const containerProps = useMemo(() => ({
          style: { margin: props.margin },
          children: <>{props.margin}</>
        }), [props.margin])
        return <ContainerWithMemo {...containerProps} />
      }

      const wrapper = mount(<Test margin="10" />)
      wrapper.setProps({ margin: '20' })
      chai.expect(useHook.callCount).to.equal(2)
    })

    it('should render repeatedly without memo hook', () => {
      const Test = (props) => <ContainerWithMemo style={{ style: props.margin }} />
      const wrapper = mount(<Test margin="10" />)
      wrapper.setProps({ margin: '10' })
      wrapper.setProps({ margin: '10' })
      chai.expect(useHook.callCount).to.equal(3)
    })

    afterEach(() => {
      clearMiddlewares()
    })

  })

})
