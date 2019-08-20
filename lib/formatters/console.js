function ConsoleFormatter () {
  return {
    emitSuite (suiteName) {
      console.log(`\n ${suiteName}`)

      return {
        emitError (err) {
          console.error(err)
        },
        emitTest (testName) {
          console.log(`  ${testName}`)
        }
      }
    }
  }
}

module.exports = {
  ConsoleFormatter
}
