function NoopFormatter () {
  return {
    emitError (err) {
      throw err
    },
    emitTest (testName) {},
    emitSuite (suiteName) {
      return this
    }
  }
}

module.exports = {
  NoopFormatter
}
