module.exports = {
  sleep: function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },
  floorTo2Digits: function (num) {
    return Number(num.toFixed(2))
  }
}
