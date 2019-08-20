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
    async runAll () {
      await this.runTests(this.requireSuites(options.paths))
      options.formatter.end()
    }
  }
}

module.exports = {
  Suites
}
