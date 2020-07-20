'use strict'

console.log("Hnefatafl v1.0.0 started.");

const CONST = require('./game/constants.js')

var port = process.env.PORT || 8000

var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

var GameManager = require('./game/manager.js')
var Game = require('./game/game.js')
var Player = require('./game/player.js')
var Manager = new GameManager()

var playerNum = 0

server.listen(port)

console.log('Listening on port %d in %s mode', server.address().port, app.settings.env)

app.use(express.static(__dirname + '/static'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

function randRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function newCode() {
    var code = ""
    var choices = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ"

    for(var i = 0; i < CONST.CODE_LEN; i++) {
        code += choices.charAt(randRange(0, 26))
    }

    while(Manager.gameExists(code)) {
        code = newCode()
    }

    return code
}

io.on('connection', function(socket) {
    var game;

    socket.id = playerNum++;

    socket.on('createGame', function(data) {
        var code = newCode()
        var player = new Player(code, data.name, socket.id, socket, ['white', 'black'][randRange(0, 1)])
        var game = new Game(code)

        socket.player = player

        game.setPlayer(player.color, player)

        Manager.addGame(code, game)

        socket.emit('createCode', { code: code })
    })

    socket.on('joinGame', function(data) {
        var game = Manager.games[data.code]

        if(game == null) {
            socket.emit('startGame', { status: null })
        } else if(game.isReady()) {
            socket.emit('startGame', { status: 'full' })
        } else {
            var opponent
            var lastColor = "black"

            var nameBlack = ""
            var nameWhite = ""

            if (game.hasBlack()) {
                lastColor = "white"
                opponent  = game.playerBlack
                nameBlack = opponent.name
                nameWhite = data.name
            } else {
                opponent  = game.playerWhite
                nameWhite = opponent.name
                nameBlack = data.name
            }

            var player = new Player(data.code, data.name, socket.id, socket, lastColor)
        
            game.setPlayer(lastColor, player)

            socket.player = player

            let names = {
                nameWhite: nameWhite, nameBlack: nameBlack
            }

            socket.emit('startGame', { code: data.code, status: 'valid', color: lastColor, ...names })
            opponent.socket.emit('startGame', { code: data.code, status: 'valid', color: (lastColor === 'white' ? 'black' : 'white'), ...names})
        }
    })

    console.log('Player ' + socket.id + ' has connected')

    socket.on('attach', function(data) {
        game = Manager.games[data.code]
    })

    socket.on('disconnect', function() {
        console.log('Player ' + socket.id + ' has left')
    })

    socket.on('direct', function(data) {
        game.playerBlack.socket.emit('move', data)
        game.playerWhite.socket.emit('move', data)
    })

    socket.on('kill', function(data) {
        game.playerBlack.socket.emit('kill', data)
        game.playerWhite.socket.emit('kill', data)
    })

    socket.on('win', function(data) {
        game.playerBlack.socket.emit('win', data)
        game.playerWhite.socket.emit('win', data)
    })
})