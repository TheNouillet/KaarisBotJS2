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

    /**
     * Methods to implement.
     * 
     * @param Message msg 
     * @memberof Listener
     */
    onNotify(msg) {
        throw "not_implemented";
    }

    /**
     * Renders a template with the given parameters, and then reply the given message with the resulting content
     * 
     * @param Message originalMessage 
     * @param string templateName 
     * @param array params 
     * @memberof Listener
     */
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

    /**
     * Renders a template with the given parameters, and then send a message to the given text channel with the resulting content
     * 
     * @param TextChannel textChannel 
     * @param string templateName 
     * @param array params
     * @memberof Listener
     */
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