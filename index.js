const express = require('express')
const app = express()
const server = require('http').createServer(app)
const jwt = require('jsonwebtoken')
const { floorTo2Digits, sleep } = require('./util')
const { updateRoundEnd } = require('./api')

require('dotenv').config()

// Temp page
app.get('/index', function (req, res) {
  res.sendFile(__dirname + '/public/show.html')
})

app.get('/index2', function (req, res) {
  res.sendFile(__dirname + '/public/show2.html')
})

app.get('/index3', function (req, res) {
  res.sendFile(__dirname + '/public/show3.html')
})

app.get('/index4', function (req, res) {
  res.sendFile(__dirname + '/public/show4.html')
})

app.get('/index5', function (req, res) {
  res.sendFile(__dirname + '/public/show5.html')
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
      const { isStart, round } = data
      if (!isStart) {
        io.emit('next-round', {
          isStart,
          round,
          timestamp: new Date().getTime()
        })
      } else {
        io.emit('next-round', {
          isStart,
          round,
          timestamp: new Date().getTime()
        })
        await sleep(1000)
        const {
          multiplierPerLoop,
          speedPerLoopMS,
          percentageRandomDrop,
          maxMultiplier
        } = data.settings
        players = round.players
        playersSortAmount = players.sort((a, b) => b.amount - a.amount)
        const totalAmount = playersSortAmount.reduce((prev, cur) => {
          return prev + cur.amount
        }, 0)
        multiplier = 1
        remainingAmount = totalAmount
        largestAmountPlayer = playersSortAmount[0]?.amount || 0

        io.emit('events', {
          x: floorTo2Digits(multiplier),
          timestamp: new Date().getTime()
        })

        while (
          largestAmountPlayer * multiplier <= remainingAmount &&
          Math.random() >= percentageRandomDrop / 100 &&
          multiplier <= maxMultiplier
        ) {
          await sleep(speedPerLoopMS)
          multiplier = multiplier + multiplierPerLoop
          io.emit('events', {
            x: floorTo2Digits(multiplier),
            timestamp: new Date().getTime()
          })
          // Check player auto stop
          for (
            let indexPlayer = 0;
            indexPlayer < players.length;
            indexPlayer++
          ) {
            if (
              player.autoStop &&
              floorTo2Digits(multiplier) === player.autoStop
            ) {
              const playerJump = {
                ...playersSortAmount[indexPlayer],
                multiplier: floorTo2Digits(multiplier)
              }
              playersJump.push(playerJump)
              remainingAmount -= floorTo2Digits(
                playersSortAmount[indexPlayer].amount * multiplier
              )
              playersSortAmount.splice(indexPlayer, 1)
              largestAmountPlayer = playersSortAmount[0]?.amount || 0
              io.emit('player-jump-client', {
                x: floorTo2Digits(multiplier),
                p: playerJump,
                timestamp: new Date().getTime()
              })
            }
          }
        }

        io.emit('events', 'Round end!!!!!!')

        const totalAmountPlayerJump = playersJump.reduce((prev, cur) => {
          return prev + floorTo2Digits(cur.amount * cur.multiplier)
        }, 0)

        // Update round
        const { _id } = round
        await updateRoundEnd(_id, { playersJump, totalAmountPlayerJump })

        players = []
        playersJump = []
        playersSortAmount = []
        multiplier = 1
        remainingAmount = 0
        largestAmountPlayer = 0
      }
    }
  })

  socket.on('player-jump-server', () => {
    if (socket.userInformation) {
      const { address } = socket.userInformation
      const indexPlayer = playersSortAmount.findIndex(
        (p) => p.address === address
      )
      if (
        indexPlayer >= 0 &&
        largestAmountPlayer * multiplier <= remainingAmount
      ) {
        const playerJump = {
          ...playersSortAmount[indexPlayer],
          multiplier: floorTo2Digits(multiplier)
        }
        playersJump.push(playerJump)
        remainingAmount -= floorTo2Digits(
          playersSortAmount[indexPlayer].amount * multiplier
        )
        playersSortAmount.splice(indexPlayer, 1)
        largestAmountPlayer = playersSortAmount[0]?.amount || 0
        io.emit('player-jump-client', {
          x: floorTo2Digits(multiplier),
          p: playerJump,
          timestamp: new Date().getTime()
        })
      }
    }
  })
})

server.listen(process.env.PORT, () => {
  console.log(`Socket running on PORT: ${process.env.PORT}`)
})
