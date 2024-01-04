const axios = require('axios')
const { sleep } = require('./util')

require('dotenv').config()

const apiUrl = process.env.API_URL || ''

module.exports = {
  updateRoundEnd: async function (idRound, body) {
    const url = `${apiUrl}/rounds/${idRound}/end`
    const headers = { 'x-api-key': process.env.X_ACCESS_TOKEN }
    let response = await axios.patch(url, body, {
      headers: headers
    })
    while (!response.data.success) {
      await sleep(5000)
      response = await axios.patch(url, body, {
        headers: headers
      })
    }
  }
}
