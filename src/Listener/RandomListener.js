"use strict";

const Listener = require("../Listener");
const CommandService = require('../Utils/CommandService');

class RandomListener extends Listener {
    constructor() {
        super();

        this.commandService = new CommandService();
        this.pool = [];
    }

    onNotify(msg) {
        var commandArray = this.commandService.parseCommand(msg);
        if(commandArray !== null && commandArray[0] == "random") {
            if(commandArray.length === 2) {
                switch (commandArray[1]) {
                    case "pull":
                        try {
                            var element = this.pullFromPool();
                            msg.reply(element + " !");
                        } catch (err) {
                            if(err === "empty_pool") {
                                msg.reply("no element in pool !");
                            }
                        }
                        break;
                    case "clean":
                        this.cleanPool();
                        msg.reply("pool cleaned !");
                        break;
                    case "status":
                        msg.reply(this.getStatusMessage());
                        break;
                    default:
                        msg.reply(this.getHelpMessage());
                        break;
                }
            } else if(commandArray.length > 2) {
                var element = commandArray[2];
                switch (commandArray[1]) {
                    case "add":
                        this.addToPool(element);
                        msg.reply("added \"" + element + "\" to the pool.");
                        break;
                    case "remove":
                        if(this.removeFromPool(element)) {
                            msg.reply("removed \"" + element + "\" from the pool.");
                        } else {
                            msg.reply("\"" + element + "\" is not in the pool !");
                        }
                        break;
                    default:
                        msg.reply(this.getHelpMessage());
                        break;
                }
            } else {
                msg.reply(this.getHelpMessage());
            }
        }
    }


    /**
     * Retrieve the help message
     * 
     * @returns string The help message content
     * @memberof RandomListener
     */
    getHelpMessage() {
        var content = "\n\"" + this.commandService.specialCharacter + "random add <element>\" to add to the random pool\n";
        content += "\"" + this.commandService.specialCharacter + "random delete <element>\" to remove from the random pool\n";
        content += "\"" + this.commandService.specialCharacter + "random pull\" to pull a random element from the pool\n";
        content += "\"" + this.commandService.specialCharacter + "random clean\" to remove all elements\n";
        content += "\"" + this.commandService.specialCharacter + "random status\" to view all elements\n";
        return content;
    }


    /**
     * Add an element to the pool
     * 
     * @param string element A string to add to the pool
     * @memberof RandomListener
     */
    addToPool(element) {
        this.pool.push(element);
    }


    /**
     * Remove an element from the random pool
     * 
     * @param string element The element to remove
     * @returns boolean Return true if the element is found, else false
     * @memberof RandomListener
     */
    removeFromPool(element) {
        var index = this.pool.indexOf(element);
        if(index === -1) {
            return false;
        } else {
            this.pool.splice(index);
            return true;
        }
    }

    /**
     * Pull a random value from the pool
     * 
     * @returns string A random element from the pool
     * @memberof RandomListener
     * @throws "empty_pool" When the pool is empty
     */
    pullFromPool() {
        if(this.pool.length === 0) {
            throw "empty_pool";
        } else {
            return this.pool[Math.floor(Math.random() * this.pool.length)];
        }
    }


    /**
     * Remove all elements from the pool
     * 
     * @memberof RandomListener
     */
    cleanPool() {
        this.pool = [];
    }


    /**
     * Generate the list of elements in the pool
     * 
     * @returns string The message content to display the list
     * @memberof RandomListener
     */
    getStatusMessage() {
        if(this.pool.length === 0) {
            return "no element in pool !";
        }
        var content = "\n";
        this.pool.forEach(element => {
            content += "- *" + element + "*\n";
        });
        return content;
    }
}

module.exports = RandomListener;