"use strict";

const Listener = require("../Listener");
const CommandService = require('../Utils/CommandService');
const TemplateHelper = require('../Utils/TemplateHelper');

class RandomListener extends Listener {
    constructor() {
        super();

        this.commandService = new CommandService();
        this.templateHelper = new TemplateHelper();
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
                            this.renderAndReply(msg, 'random/pull.txt', {
                                element: element
                            });
                        } catch (err) {
                            if(err === "empty_pool") {
                                this.renderAndReply(msg, 'random/no_element.txt');
                            }
                        }
                        break;
                    case "clean":
                        this.cleanPool();
                        this.renderAndReply(msg, 'random/clean.txt');
                        break;
                    case "status":
                        this.renderAndReply(msg, 'random/status.txt', {
                            pool: this.templateHelper.prepareRandomPool(this.pool)
                        });
                        break;
                    default:
                        this.renderAndReply(msg, 'random/help.txt', {
                            specialCharacter: this.commandService.specialCharacter
                        });
                        break;
                }
            } else if(commandArray.length > 2) {
                var element = commandArray[2];
                switch (commandArray[1]) {
                    case "add":
                        this.addToPool(element);
                        this.renderAndReply(msg, 'random/add.txt', {
                            element: element
                        });
                        break;
                    case "remove":
                        var success = this.removeFromPool(element);
                        this.renderAndReply(msg, 'random/remove.txt', {
                            success: success,
                            element: element
                        });
                        break;
                    default:
                        this.renderAndReply(msg, 'random/help.txt', {
                            specialCharacter: this.commandService.specialCharacter
                        });
                        break;
                }
            } else {
                this.renderAndReply(msg, 'random/help.txt', {
                    specialCharacter: this.commandService.specialCharacter
                });
            }
        }
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
}

module.exports = RandomListener;