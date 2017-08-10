"use strict";

const Listener = require("../Listener");

class AudioListener extends Listener {
    constructor(fileMap, specialCharacter) {
        super();

        this.canBroadcast = true;
        this.fileMap = fileMap;
        this.specialCharacter = specialCharacter;
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
                if (commandArray[0] == listener.specialCharacter + alias) {
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
        var commandArray = message.content.split(" ");
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
        if (fileName && this.canBroadcast) {
            if (message.member.voiceChannel) {
                message.member.voiceChannel.join()
                    .then(connection => { // Connection is an instance of VoiceConnection
                        this.canBroadcast = false;
                        const dispatcher = connection.playFile(fileName);
                        dispatcher.on('end', () => {
                            message.member.voiceChannel.leave();
                            this.canBroadcast = true;
                        });
                    })
                    .catch(console.log);
            } else {
                message.reply('You need to join a voice channel first!');
            }
        }
    }
}

module.exports = AudioListener;