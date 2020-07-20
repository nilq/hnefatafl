'use strict'

class Player {
    constructor(code, name, id, socket, color) {
        this.code = code
        this.name = name
        this.id = id
        this.socket = socket
        this.color = color
    }
}

module.exports = Player