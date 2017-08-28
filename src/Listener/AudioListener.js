"use strict";

const Listener = require("../Listener");
const CommandService = require('../Utils/CommandService');

class AudioListener extends Listener {
    constructor(fileMap) {
        super();

        this.fileMap = fileMap;
        this.commandService = new CommandService();
        this.audioQueue = [];
    }


    /**
     * Get a random property of an object
     * 
     * @param Object object A JS Object
     * @returns A random property of it
     * @memberof AudioListener
     */
    randomProperty(object) {
        var keys = Object.keys(object);
        return object[keys[Math.floor(keys.length * Math.random())]];
    }


    /**
     * Check if a user is in the allowed user list
     * 
     * @param int authorId The user id
     * @param array allowedIds The allowed user id array
     * @returns true if the user id is in the allowed user array, else false
     * @memberof AudioListener
     */
    isAllowed(authorId, allowedIds) {
        var res = false;
        allowedIds.forEach((id) => {
            if (id == authorId) {
                res = true;
            }
        });
        return res;
    }


    /**
     * Fetch the audio file name corresponding to the given command array.
     * 
     * @param array commandArray An array corresponding of the alias and a command
     * @param integer authorId The id of the user querying the audio file
     * @returns string The name of the audio file
     * @throws "not_allowed" if the querying user is not allowed to use the command
     * @memberof AudioListener
     */
    getFileName(commandArray, authorId) {
        var res = null;
        var listener = this;
        this.fileMap.forEach(function (theme) {
            theme.aliases.forEach(function (alias) {
                if (commandArray[0] == alias) {
                    if (theme.restricted && !listener.isAllowed(authorId, theme.allowedIds)) {
                        console.log(authorId + " not allowed for theme " + alias);
                        throw "not_allowed";
                    }
                    if (commandArray.length < 2) {
                        res = listener.randomProperty(theme.commands);
                    }
                    else {
                        if (commandArray[1] in theme.commands) {
                            res = theme.commands[commandArray[1]];
                        }
                    }
                }
            });
        });

        return res;
    }

    onNotify(message) {
        var commandArray = this.commandService.parseCommand(message);
        if(commandArray !== null) {
            if (!message.guild) return;
            try {
                var fileName = this.getFileName(commandArray, message.author.id);
            }
            catch (err) {
                if (err == "not_allowed") {
                    message.reply("you are not allowed to use this command."); // Notify the user if there is an error
                }
                else {
                    console.log(err);
                }
            }
            if (fileName) {
                if (message.member.voiceChannel) {
                    this.playFile(message.member.voiceChannel, fileName);
                } else {
                    message.reply('You need to join a voice channel first!');
                }
            }
        }
    }


    /**
     * Play an audi stream from a file to a voice channel
     * 
     * @param VoiceChannel voiceChannel The voice channel to connect to
     * @param string fileName The name of the file to play
     * @memberof AudioListener
     */
    playFile(voiceChannel, fileName) {
        voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
            if(!connection.speaking) {
                var dispatcher = connection.playFile(fileName);
                dispatcher.on('end', () => {
                    dispatcher = null;
                    var newFileName = this.popQueue();
                    if(newFileName != null) {
                        this.playFile(voiceChannel, newFileName);
                    } else {
                        voiceChannel.leave();
                    }
                });
            } else { // We're already speaking, so we put the audio in the queue
                this.pushQueue(fileName);
            }
        })
        .catch(err => {console.log(err)});
    }


    /**
     * Check if the audio queue is empty or not
     * 
     * @returns boolean true if the queue is empty, else false
     * @memberof AudioListener
     */
    isQueueEmpty() {
        return this.audioQueue.length == 0;
    }


    /**
     * Return the next element in queue while removing it from the queue
     * 
     * @returns string|null Returns the file name to play, or null if the queue is empty
     * @memberof AudioListener
     */
    popQueue() {
        if(this.isQueueEmpty()) {
            return null;
        }
        return this.audioQueue.shift();
    }

    /**
     * Push the current audio file in the queue
     * 
     * @param string fileName The name of the audio file
     * @memberof AudioListener
     */
    pushQueue(fileName) {
        this.audioQueue.push(fileName);
    }
}

module.exports = AudioListener;