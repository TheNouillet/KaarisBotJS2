"use strict";

class CommandService {
    constructor() {
        this.specialCharacter = "!";
    }


    /**
     * Transform a message into a command array, without the special character 
     * 
     * @param string message The message to parse
     * @returns string|null Returns the parsed message content, or null if the message doesn't begin with the special character
     * @memberof CommandService
     */
    parseCommand(message) {
        if(message.content[0] === this.specialCharacter) {
            var strippedMessage = message.content.substr(1);
            return strippedMessage.split(" ");
        } else {
            // The command doesn't begins with the special character
            return null;
        }
    }
}

module.exports = CommandService;