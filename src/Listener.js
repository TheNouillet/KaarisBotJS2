"use strict";

class Listener {
    notify(msg) {
        this.onNotify(msg);
    }
}

module.exports = Listener;