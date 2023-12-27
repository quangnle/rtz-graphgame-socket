const express = require('express')
const app = express()
const server = require('http').createServer(app)
const jwt = require('jsonwebtoken')

require('dotenv').config()

// Temp page
app.get('/index', function (req, res) {
  res.sendFile(__dirname + '/public/show.html')
})

app.get('/index2', function (req, res) {
  res.sendFile(__dirname + '/public/show2.html')
})

const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
})

let players = []
let playersJump = []
let playersSortAmount = []
let multiplier = 1
let remainingAmount = 0
let largestAmountPlayer = 0

io.use((socket, next) => {
  socket.isVerifyTokenApi = false
  socket.isVerifyTokenClient = false
  socket.userInformation = null
  if (socket.handshake.query) {
    if (socket.handshake.query.tokenServer) {
      // Verify token from server api
      const token = socket.handshake.query.tokenServer
      if (token === process.env.SOCKET_SECRET_KEY) {
        socket.isVerifyTokenApi = true
      } else {
        return next(new Error('Authentication error'))
      }
    }
    if (socket.handshake.query.tokenClient) {
      const token = socket.handshake.query.tokenClient
      const user = jwt.verify(token, process.env.JWT_SECRET_KEY)
      if (user) {
        socket.userInformation = user
      }
    }
  }
  next()
}).on('connection', async (socket) => {
  socket.on('run-round', async (data) => {
    if (socket.isVerifyTokenApi) {
      const { round } = data
      players = round.members
      playersSortAmount = players.sort((a, b) => b.amount - a.amount)
      const totalAmount = playersSortAmount.reduce((prev, cur) => {
        return prev + cur.amount
      }, 0)
      multiplier = 1
      remainingAmount = totalAmount
      largestAmountPlayer = playersSortAmount[0]?.amount || 0

      io.emit('events', { x: floorTo2Digits(multiplier) })

      while (
        largestAmountPlayer * multiplier <= remainingAmount &&
        Math.random() >= 0.01 &&
        multiplier <= 100
      ) {
        await sleep(200)
        multiplier = multiplier + 0.01
        io.emit('events', { x: floorTo2Digits(multiplier) })
      }

      const totalAmountPlayerJump = playersJump.reduce((prev, cur) => {
        return prev + cur.amount * cur.multiplier
      }, 0)

      console.log('totalAmount', totalAmount)
      console.log('totalAmountPlayerJump', totalAmountPlayerJump)
      console.log('playersJump', playersJump)
      console.log('end')
      console.log('round end!!!!!!')

      players = []
      playersJump = []
      playersSortAmount = []
      multiplier = 1
      remainingAmount = 0
      largestAmountPlayer = 0
    }
  })

  socket.on('player-jump-server', (data) => {
    console.log(345)
    console.log('socket.userInformation', socket.userInformation)
    const { address } = data

    const indexPlayer = playersSortAmount.findIndex(
      (p) => p.address === address
    )
    console.log('indexPlayer', indexPlayer)

    if (indexPlayer >= 0) {
      playersJump.push({
        ...playersSortAmount[indexPlayer],
        multiplier: floorTo2Digits(multiplier)
      })
      remainingAmount -= playersSortAmount[indexPlayer].amount * multiplier
      playersSortAmount.splice(indexPlayer, 1)
      largestAmountPlayer = playersSortAmount[0]?.amount || 0
      io.emit('player-jump-client', {
        x: floorTo2Digits(multiplier),
        p: playersSortAmount[indexPlayer]
      })
    }
  })
})

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const floorTo2Digits = (num) => {
  return Number(Math.floor(num * 100) / 100)
}

server.listen(process.env.PORT, () => {
  console.log(`Socket running on PORT: ${process.env.PORT}`)
})
