function Suites (options) {
  return {
    async runTests (suites) {
      for (let { suite, path } of suites) {
        options.formatter.emitFile(path)
        await suite.runTests(options.formatter)
      }
    },
    requireSuites (paths) {
      return paths.map(function (path) {
        return {
          suite: require(path).suite,
          path: require.resolve(path)
        }
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
