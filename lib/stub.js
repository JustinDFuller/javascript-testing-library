function stub ({ module, method, returns }) {
  require(module)[method] = returns
}

module.exports = {
  stub
}
