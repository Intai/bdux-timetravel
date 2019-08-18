import { F } from 'ramda'
import React, { useEffect } from 'react'
import { resume } from '../../actions/timetravel-action'

const getDisplayName = (Component) => (
  Component.displayName || Component.name || 'Component'
)

export const decorateComponent = (Component = F) => (
  class extends React.Component {
    static displayName = getDisplayName(Component)
    static defaultProps = {}

    componentDidMount() {
      if (this.props.dispatch) {
        this.props.dispatch(resume())
      }
    }

    render() {
      return React.createElement(
        Component, this.props
      )
    }
  }
)

export const useHook = (_props, params) => {
  const { dispatch } = params || {}

  useEffect(
    () => {
      if (dispatch) {
        dispatch(resume())
      }
    },
    // only on mount and unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
