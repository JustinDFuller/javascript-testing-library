function NoopFormatter () {
  return {
    emitError (err) {},
    emitTest (testName) {},
    emitSuite (suiteName) {
      return this
    }
  }
}

module.exports = {
  NoopFormatter
}
