import * as R from 'ramda'
import React from 'react'
import TimeTravelAction from '../../actions/timetravel-action'

const getDisplayName = (Component) => (
  Component.displayName || Component.name || 'Component'
)

export const decorateComponent = (Component = R.F) => (
  class extends React.Component {
    static displayName = getDisplayName(Component)
    static defaultProps = {}

    /* istanbul ignore next */
    constructor() {
      super()
    }

    componentDidMount() {
      TimeTravelAction.resume()
    }

    render() {
      return React.createElement(
        Component, this.props
      )
    }
  }
)
