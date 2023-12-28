const axios = require('axios')

require('dotenv').config()

const apiUrl = process.env.API_URL || ''

module.exports = {
  updateRoundEnd: async function (idRound, body) {
    const url = `${apiUrl}/rounds/${idRound}/end`
    const headers = { 'x-api-key': process.env.X_ACCESS_TOKEN }
    axios
      .patch(url, body, {
        headers: headers
      })
      .then(function (response) {
        // handle success
        const { data } = response
        console.log(data)
      })
      .catch(function (error) {
        console.log(error)
      })
      .finally(function () {
        console.log('Update round successfully')
      })
  }
}
