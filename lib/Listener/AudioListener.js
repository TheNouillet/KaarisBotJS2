"use strict";

const Listener = require("../Listener");

class AudioListener extends Listener {
    constructor(bot, fileMap, specialCharacter) {
        super();
        
        this.bot = bot;
        this.fileMap = fileMap;
        this.specialCharacter = specialCharacter;
    }
    
    randomProperty(object) {
        var keys = Object.keys(object);
        return object[keys[Math.floor(keys.length * Math.random())]];
    }
    
    isAllowed(authorId, allowedIds) {
        var res = false;
        allowedIds.forEach( (id) => {
            if(id == authorId) {
                res = true;
            }
        });
        return res;
    }

    getFileName(commandArray, authorId) {
        var res = null;
        var listener = this;
        this.fileMap.forEach(function(theme) {
            theme.aliases.forEach(function(alias) {
                if(commandArray[0] == listener.specialCharacter + alias) {
                    if(theme.restricted && !listener.isAllowed(authorId, theme.allowedIds)) {
                        console.log(authorId + " not allowed for theme " + alias);
                        throw "not_allowed";
                    }
                    if(commandArray.length < 2) {
                        res = listener.randomProperty(theme.commands);
                    }
                    else {
                        if(commandArray[1] in theme.commands) {
                            res = theme.commands[commandArray[1]];
                        }
                    }
                }
            });
        });
        
        return res;
    }
    
    onNotify(msg) {
        var bot = this.bot;
        var commandArray = msg.content.split(" ");
        if(!msg.channel.guild) { // Check if the message was sent in a guild
            //bot.createMessage(msg.channel.id, "This command can only be run in a server.");
            return;
        }
        if(!msg.member.voiceState.channelID) { // Check if the user is in a voice channel
            //bot.createMessage(msg.channel.id, "You are not in a voice channel.");
            return;
        }
        try {
            var fileName = this.getFileName(commandArray, msg.author.id);
        }
        catch (err) {
            if(err == "not_allowed") {
                bot.createMessage(msg.channel.id, "<@" + msg.author.id + "> You are not allowed to use this command."); // Notify the user if there is an error
            }
            else {
                console.log(err);
            }
        }
        if(fileName) {
            console.log('Playing ' + fileName);
            bot.joinVoiceChannel(msg.member.voiceState.channelID).catch((err) => { // Join the user's voice channel
                bot.createMessage(msg.channel.id, "Error joining voice channel: " + err.message); // Notify the user if there is an error
                console.log(err); // Log the error
            }).then((connection) => {
                connection.play(fileName); // Play the file and notify the user
                connection.once("end", () => {
                    if(!connection.playing) {
                        bot.leaveVoiceChannel(msg.member.voiceState.channelID);
                    }
                });
            });
        }
    }
}

module.exports = AudioListener;