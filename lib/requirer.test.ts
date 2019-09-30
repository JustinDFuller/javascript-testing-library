import { Suite } from './Suite'
import { requirer } from './requirer'

export const suite = new Suite({
  name: 'requierer'
})

suite.addTest({
  name: 'requires a path',
  test (t) {
    let error = 'Expected an error to be thrown'

    try {
      requirer('some-fake-module-name')
    } catch (e) {
      error = e.message.split('\n')[0]
    }

    t.equal({
      expected: "Cannot find module 'some-fake-module-name'",
      actual: error
    })
  }
})

suite.addTest({
  name: 'requires an array of paths',
  test (t) {
    let error = 'Expected an error to be thrown'

    try {
      requirer(['lodash', 'some-fake-module-name'])
    } catch (e) {
      error = e.message.split('\n')[0]
    }

    t.equal({
      expected: "Cannot find module 'some-fake-module-name'",
      actual: error
    })
  }
})
