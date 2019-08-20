function NoopFormatter () {
  return {
    emitError (err) {
      throw err
    },
    emitTest (testName) {},
    emitFile () {},
    emitSuite (suiteName) {
      return this
    }
  }
}

module.exports = {
  NoopFormatter
}
