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
      console.log('response.data', response.data)
      response = await axios.patch(url, body, {
        headers: headers
      })
    }
    // .then(function (response) {
    //   // handle success
    //   const { data } = response
    //   console.log(data)
    // })
    // .catch(function (error) {
    //   console.log(error.message)
    // })
    // .finally(function () {
    //   console.log('Update round successfully')
    // })
  }
}
