'use strict'

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}


var PLAYER = "black"

const WIDTH  = 11
const HEIGHT = 11

// 5: KING
// 4: THRONE
// 3: WHITE
// 2: BLACK
// 1: CASTLE
// 0: BLANK FIELD
const BOARD = [
    [ 1, 0, 0, 2, 2, 2, 2, 2, 0, 0, 1 ], // 1
    [ 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0 ], // 2
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 3
    [ 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2 ], // 4
    [ 2, 0, 0, 0, 3, 3, 3, 0, 0, 0, 2 ], // 5
    [ 2, 2, 0, 3, 3, 4, 3, 3, 0, 2, 2 ], // 6
    [ 2, 0, 0, 0, 3, 3, 3, 0, 0, 0, 2 ], // 7
    [ 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2 ], // 8
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 9
    [ 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0 ], // 10
    [ 1, 0, 0, 2, 2, 2, 2, 2, 0, 0, 1 ], // 11
]

var PIECE_DATA = []

for(var x = 0; x < WIDTH; x++) {
    var row = []

    for(var y = 0; y < HEIGHT; y++) {
        row.push(0)
    }

    PIECE_DATA.push(row)
}

var game
var code
var playerColor
var whiteName
var blackName
var whiteName
var opponent
var player

var pieces

function start(gameCode, color, nameBlack, nameWhite) {
    code = gameCode
    playerColor = color
    blackName = nameBlack
    whiteName = nameWhite
    
    var config = {
        type: Phaser.AUTO,
        width: 1100,
        height: 1100,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        },
        scene: {
            preload: preload,
            create: create
        },
        parent: 'game'
    }

    game = new Phaser.Game(config)
    pieces = []
}

function preload () {
    this.load.setBaseURL('http://0.0.0.0:8000/')

    this.load.image('white_home', 'assets/white_home.png')
    this.load.image('black_home', 'assets/black_home.png')
    this.load.image('throne', 'assets/throne.png')
    this.load.image('blank', 'assets/blank.png')

    this.load.image('white_soldier', 'assets/pieces/white_soldier.png')
    this.load.image('black_soldier', 'assets/pieces/black_soldier.png')

    this.load.image('king', 'assets/pieces/king.png')
}

function checkKill(color, x, y) {
    let enemyColor = color === 'black' ? 3 : 2
    let properColor = color === 'black' ? 2 : 3

    for(var dx = -1; dx < 2; dx++) {
        if(PIECE_DATA[clamp(x + dx, 0, 10)][y] === enemyColor) {
            console.log("it's here at x + " + dx)
            console.log("this is at x + " + dx*2 + " = " + PIECE_DATA[clamp(x + dx * 2, 0, 10)][y])

            if(PIECE_DATA[clamp(x + dx * 2, 0, 10)][y] === properColor) {
                console.log("another friend on x + " + dx * 2)
                pieces.forEach((piece) => {
                    if(piece.getData('data_x') === clamp(x + dx, 0, 10) && piece.getData('data_y') === y) {
                        socket.emit('kill', { x: piece.x, y: piece.y})
                    }
                })
            }

            console.log("\n")
        }
    }

    for(var dy = -1; dy < 2; dy++) {
        if(PIECE_DATA[x][clamp(y + dy, 0, 10)] === enemyColor) {
            console.log("it's here at y + " + dy)
            console.log("this is at y + " + dy*2 + " = " + PIECE_DATA[x][clamp(y + dy * 2, 0, 10)])
            if(PIECE_DATA[x][clamp(y + dy * 2, 0, 10)] === properColor) {
                console.log("another friend on y + " + dy * 2)
                
                pieces.forEach((piece) => {
                    if(piece.getData('data_x') === x && piece.getData('data_y') === clamp(y + dy, 0, 10)) {
                        socket.emit('kill', { x: piece.x, y: piece.y})
                    }
                })
            }
            console.log("\n")
        }
    }
}

function create () {
    this.cameras.main.backgroundColor.setTo(255, 255, 255)

    this.white_soldiers = this.add.group()
    this.black_soldiers = this.add.group()

    for(var y = 0; y < WIDTH; y++) {
        for(var x = 0; x < HEIGHT; x++) {
            var field = BOARD[y][x]

            var fx = 100 * x + 50
            var fy = 100 * y + 50

            switch(field) {
                case 1: // CASTLE NOT THRONE, BUT THRONE SPRITE STILL
                    this.add.sprite(fx, fy, 'throne')
        
                    break
        
                case 2:
                    this.add.sprite(fx, fy, 'black_home')
        
                    var a = this.black_soldiers.create(fx, fy, 'black_soldier').setInteractive()
        
                    a.setData('type', "black")
                    a.setData('direction', "none")
        
                    a.setData('data_x', x)
                    a.setData('data_y', y)

                    a.setDepth(100)
        
                    pieces.push(a)
        
                    PIECE_DATA[x][y] = 2
        
                    this.input.setDraggable(a)
        
                    break
        
                case 3:
                    this.add.sprite(fx, fy, 'white_home')
        
                    var a = this.white_soldiers.create(fx, fy, 'white_soldier').setInteractive()
        
                    a.setData('type', "white")
                    a.setData('direction', "none")
        
                    a.setData('data_x', x)
                    a.setData('data_y', y)

                    a.setDepth(100)
        
                    pieces.push(a)
        
                    PIECE_DATA[x][y] = 3
        
                    this.input.setDraggable(a)
        
                    break
        
                case 4:
                    this.add.sprite(fx, fy, 'throne')
        
                    var a = this.white_soldiers.create(fx, fy, 'king').setInteractive()
        
                    a.setData('type', "king")
                    a.setData('direction', "none")
        
                    a.setData('data_x', x)
                    a.setData('data_y', y)

                    a.setDepth(100)
        
                    pieces.push(a)
        
                    PIECE_DATA[x][y] = 5
        
                    this.input.setDraggable(a)
        
                    break
            }

            this.add.sprite(fx, fy, 'blank')
        }

        socket.emit('attach', { code: code })
    }

    this.input.on('dragstart', function (pointer, gameObject, dragX, dragY) {
        gameObject.setTint(0xDDDDDD)
        gameObject.setDepth(100)

        gameObject.setData("ox", gameObject.x)
        gameObject.setData("oy", gameObject.y)

        var x = gameObject.getData('data_x')
        var y = gameObject.getData('data_y')

        PIECE_DATA[x][y] = 0 // YOU ARE PICKING IT UP!!
    })

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {


        if(PLAYER !== playerColor || (gameObject.getData("type") !== playerColor && !(playerColor === 'white' && gameObject.getData("type") === 'king'))) {
            return
        }

        var ox = gameObject.x
        var oy = gameObject.y

        var dir = gameObject.getData('direction')

        if(dir === 'x' || dir === 'none') {
            var x = Phaser.Math.Snap.To(dragX + 50, 100) - 50
            var cx = clamp(Math.floor((x - 50) / 100), 0, WIDTH - 1)

            var other_cx = clamp(Math.floor((gameObject.x - 50) / 100), 0, WIDTH - 1)

            if(PIECE_DATA[cx][gameObject.getData('data_y')] === 0) {

                while (gameObject.x !== x) {
                    if (gameObject.x < x && PIECE_DATA[other_cx][gameObject.getData('data_y')] === 0) {
                        gameObject.x++
                    } else if(gameObject.x > x && PIECE_DATA[other_cx][gameObject.getData('data_y')] === 0) {
                        gameObject.x--
                    } else {
                        break
                    }
                }
            }

            if(gameObject.x !== ox) {
                gameObject.setData('direction', 'x')
            }
        }

        if(dir === 'y' || dir === 'none') {
            var y = Phaser.Math.Snap.To(dragY + 50, 100) - 50
            var cy = clamp(Math.floor((y - 50) / 100), 1, HEIGHT)

            var other_cy = clamp(Math.floor((gameObject.y - 50) / 100), 1, HEIGHT)

            if(PIECE_DATA[gameObject.getData('data_x')][cy] === 0) {
                while (gameObject.y !== y) {
                    if (gameObject.y < y && PIECE_DATA[gameObject.getData('data_x')][other_cy] === 0) {
                        gameObject.y++
                    } else if(gameObject.y > y && PIECE_DATA[gameObject.getData('data_x')][other_cy] === 0) {
                        gameObject.y--
                    } else {
                        break
                    }
                }
            }

            if(gameObject.y !== oy) {
                gameObject.setData('direction', 'y')
            }
        }

        if(gameObject.x === gameObject.getData('ox') && gameObject.y === gameObject.getData('oy')) {
            gameObject.setData('direction', 'none')
        }
    })

    this.input.on('dragend', function (pointer, gameObject) {
        gameObject.clearTint()
        gameObject.setDepth(10)

        gameObject.setData('direction', 'none')

        if(gameObject.x !== gameObject.getData('ox') || gameObject.y !== gameObject.getData('oy')) {
            var x = (gameObject.x - 50) / 100
            var y = (gameObject.y - 50) / 100

            gameObject.setData("data_x", x)
            gameObject.setData("data_y", y)

            checkKill(playerColor, x, y)

            if(gameObject.getData("type") === "white" || gameObject.getData("type") === "king") {
                PIECE_DATA[x][y] = 3

                PLAYER = "black"
            } else {
                PIECE_DATA[x][y] = 2

                PLAYER = "white"
            }

            if(gameObject.getData("type") === "king") {
                if(x + y === 10 && (x === 0 || y === 0)) {
                    alert("YOU WON!")
                    socket.emit('win', { winner: playerColor })
                }
            }

            socket.emit('direct', {
                from: {
                    x: gameObject.getData("ox"),
                    y: gameObject.getData("oy")
                },
                to: {
                    x: gameObject.x,
                    y: gameObject.y
                },
                turn: PLAYER
            })
        }
    })
}

socket.on('move', function(data) {
    var from = data.from
    var to = data.to

    PIECE_DATA[Math.floor((from.x - 50) / 100)][Math.floor((from.y - 50) / 100)] = 0
    PIECE_DATA[Math.floor((to.x - 50) / 100)][Math.floor((to.y - 50) / 100)]     = data.turn === 'black' ? 3 : 2

    pieces.forEach((piece) => {
        if (piece.x === from.x && piece.y === from.y) {
            piece.x = to.x
            piece.y = to.y

            piece.setData("data_x", (to.x - 50) / 100)
            piece.setData("data_y", (to.y - 50) / 100)
        }
    })

    PLAYER = data.turn
})

socket.on('kill', function(data) {
    pieces.forEach((piece) => {
        if(piece.x == data.x && piece.y == data.y) {
            piece.destroy()

            PIECE_DATA[(data.x - 50) / 100][(data.y - 50) / 100] = 0
        }
    })
})

socket.on('win', function(data) {
    alert("THE WINNER IS " + data.winner.toUpperCase())
})