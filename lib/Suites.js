function Suites (options) {
  return {
    async runTests (suites) {
      for (let suite of suites) {
        await suite.runTests(options.formatter)
      }
    },
    requireSuites (paths) {
      return paths.map(function (path) {
        return require(path).suite
      })
    },
    runAll () {
      this.runTests(this.requireSuites(options.paths))
    }
  }
}

module.exports = {
  Suites
}
