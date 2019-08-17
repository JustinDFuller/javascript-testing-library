function Suites (options) {
  return {
    runAll () {
      options.paths
        .map(function (path) {
          return require(path).suite
        })
        .forEach(function (suite) {
          suite.runTests()
        })
    }
  }
}

module.exports = {
  Suites
}
