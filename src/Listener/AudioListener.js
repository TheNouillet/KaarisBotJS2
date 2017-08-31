"use strict";

const Listener = require("../Listener");
const CommandService = require('../Utils/CommandService');
const ThemeService = require('../Utils/ThemeService');

class AudioListener extends Listener {
    constructor(fileMap) {
        super();

        this.commandService = new CommandService();
        this.themeService = new ThemeService();
        this.fileMap = fileMap;
        this.audioQueue = [];
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
        var themeName = commandArray[0];
        var commandName = commandArray[1];

        var command = null;
        if(commandName) {
            command = this.themeService.getCommand(this.fileMap, themeName, commandName, authorId);
        } else {
            command = this.themeService.getRandomCommand(this.fileMap, themeName, authorId);
        }

        return command.fileName;
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
     * Play an audio stream from a file to a voice channel
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