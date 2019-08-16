function Suites (options) {
  return {
    runAll () {
      options.paths.forEach(function (path) {
        require(path).suite.runTests()
      })
    }
  }
}

module.exports = {
  Suites
}
