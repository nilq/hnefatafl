'use struct'

class Manager {
    constructor() {
        this.games = {}
        this.running = true
    }

    addGame(code, game) {
        this.games[code] = game
    }

    gameExists(code) {
        return code.toUpperCase() in this.games
    }
}

module.exports = Manager