;[
  require('./Assert.test'),
  require('./test.test'),
  require('./Suite.test')
].forEach(function ({ suite }) {
  suite.runTests()
})
