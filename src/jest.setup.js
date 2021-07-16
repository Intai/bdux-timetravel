/* eslint-env jest */

import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'

Enzyme.configure({
  adapter: new Adapter()
})

function suppressDomErrors() {
  const regex = new RegExp('(Use PascalCase for React components)|'
    + '(is unrecognized in this browser)|'
    + '(Unknown event handler property)|'
    + '(React does not recognize the .* prop on a DOM element)|'
    + '(for a non-boolean attribute)')

  const actualConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0]
    if (!regex.test(message)) {
      actualConsoleError(...args)
    }
  }
}

suppressDomErrors()

jest.mock('@react-native-async-storage/async-storage', () => (
  mockAsyncStorage
))
