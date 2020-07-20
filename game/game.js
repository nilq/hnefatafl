'use strict'

class Game {
    constructor(code) {
        this.code = code
        this.turn = 'black'
    }

    setPlayer(color, player) {
        if(color === "black") {
            this.playerBlack = player
        } else {
            this.playerWhite = player
        }
    }

    hasBlack() {
        return this.playerBlack != undefined
    }

    isReady() {
        return this.hasBlack() && this.playerWhite != undefined
    }
}

module.exports = Game