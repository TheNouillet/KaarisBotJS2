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

    randomProperty(object) {
        var keys = Object.keys(object);
        return object[keys[Math.floor(keys.length * Math.random())]];
    }

    isAllowed(authorId, allowedIds) {
        var res = false;
        allowedIds.forEach((id) => {
            if (id == authorId) {
                res = true;
            }
        });
        return res;
    }

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
            const dispatcher = connection.playFile(fileName);
            dispatcher.on('end', () => {
                var newFileName = this.popQueue();
                if(newFileName != null) {
                    this.playFile(voiceChannel, newFileName);
                } else {
                    voiceChannel.leave();
                }
            });
        })
        .catch(console.log);
    }


    /**
     * Check if the audio queue is empty or not
     * 
     * @returns boolean true if the queue is empty, else false
     * @memberof AudioListener
     */
    isQueueEmpty() {
        return true;
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
        return "audio/27.mp3";
    }
}

module.exports = AudioListener;