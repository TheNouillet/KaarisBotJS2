"use strict";

var mu = require('mu2');

class Listener {
    constructor() {
        this.mu = mu;
        this.mu.root = __dirname + '/views';
    }

    notify(msg) {
        this.onNotify(msg);
    }

    onNotify(msg) {
        throw "not_implemented";
    }
}

module.exports = Listener;