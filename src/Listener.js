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

    renderAndReply(originalMessage, templateName, params = null) {
        var content = "";
        this.mu.compileAndRender(templateName, params)
        .on('data', function (data) {
            content += data.toString();
        })
        .on('end', () => {
            originalMessage.reply(content);
        });
    }

    renderAndSend(textChannel, templateName, params = null) {
        var content = "";
        this.mu.compileAndRender(templateName, params)
        .on('data', function (data) {
            content += data.toString();
        })
        .on('end', () => {
            textChannel.send(content);
        });
    }
}

module.exports = Listener;