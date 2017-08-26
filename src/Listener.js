"use strict";

class Listener {
    notify(msg) {
        this.onNotify(msg);
    }

    onNotify(msg) {
        throw "not_implemented";
    }
}

module.exports = Listener;