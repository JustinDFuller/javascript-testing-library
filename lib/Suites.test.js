const { Suite } = require('./Suite')
const { Suites } = require('./Suites')

const suite = Suite({
  name: 'Suites'
})

suite.addTest({
  name: 'runs tests in a consistent order',
  async test (t) {
    const order = []

    await Suites().runTests([
      Suite({
        name: '(consistent order suite 1)'
      })
        .addTest({
          name: '(consistent order test 1)',
          async test (t) {
            await Promise.resolve()
            order.push(1)

            t.equal({
              expected: 1,
              actual: 1
            })
          }
        })
        .addTest({
          name: '(consistent order test 2)',
          test (t) {
            order.push(2)

            t.equal({
              expected: 1,
              actual: 1
            })
          }
        }),
      Suite({
        name: '(consistent order suite 2)'
      })
        .addTest({
          name: '(consistent order test 3)',
          test (t) {
            order.push(3)

            t.equal({
              expected: 1,
              actual: 1
            })
          }
        })
        .addTest({
          name: '(consistent order test 4)',
          test (t) {
            order.push(4)

            t.equal({
              expected: 1,
              actual: 1
            })
          }
        })
    ])

    t.equal({
      actual: order,
      expected: [1, 2, 3, 4]
    })
  }
})

module.exports = {
  suite
}