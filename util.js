module.exports = {
  sleep: function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },
  floorTo2Digits: function (num) {
    return Number(Math.floor(num * 100) / 100)
  }
}
