"use strict";

const ytdl = require('ytdl-core');

const Listener = require("../Listener");
const CommandService = require('../Utils/CommandService');
const BlindTest = require('../Model/BlindTest');

class BlindTestListener extends Listener {
    constructor() {
        super();

        this.commandService = new CommandService();
        this.textChannel = null;
        this.currentBlindTest = null;
    }

    onNotify(msg) {
        var commandArray = this.commandService.parseCommand(msg);
        if(commandArray !== null && commandArray[0] == "bt") {
            if(commandArray.length > 2) {
                var command = commandArray[1];
                var parameter = commandArray[2];
                switch (command) {
                    case "propose":
                        msg.delete()
                        .then(msg => {
                            var voiceChannel = msg.member.voiceChannel;
                            if(!voiceChannel) {
                                msg.reply("you need to join a voice channel first!");
                            } else if(this.currentBlindTest != null) {
                                msg.reply("there is already a blind test occuring !");
                            } else {
                                this.propose(parameter, voiceChannel, msg.channel);
                            }
                        });
                        break;
                    case "guess":
                        if(this.currentBlindTest == null) {
                            msg.reply("there is no blind test currently occuring !");
                        } else {
                            var responseArray = commandArray.slice(2);
                            var response = responseArray.join(" ");
                            this.guess(msg.author.id, response);
                        }
                        break;
                    default:
                        msg.reply(this.getHelpMessage());
                        break;
                }
            } else if(commandArray.length > 1) {
                var command = commandArray[1];
                switch (command) {
                    case "result":
                        var voiceChannel = msg.member.voiceChannel;
                        if(this.currentBlindTest == null) {
                            msg.reply("there is no blind test currently occuring !");
                        } else if(!voiceChannel) {
                            msg.reply("you need to join a voice channel first!");
                        } else {
                            this.result(msg.member.voiceChannel);
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

    getHelpMessage() {
        var content = "\n";
        content += "\"" + this.commandService.specialCharacter + "bt propose <url>\" to propose a Youtube blind test\n";
        content += "\"" + this.commandService.specialCharacter + "bt guess <your-guess>\" to try guessing a video name\n";
        content += "\"" + this.commandService.specialCharacter + "bt result\" to determine the winner\n";
        return content;
    }

    propose(url, voiceChannel, textChannel) {
        voiceChannel.join()
        .then(connection => {
            // We fetch the video info to get the name, then we can play the video
            // (provided nothing has gone wrong)
            ytdl.getInfo(url, (err, info) => {
                if(err) {
                    console.log(err);
                } else {
                    this.textChannel = textChannel;
                    this.currentBlindTest = new BlindTest(info.title.toLowerCase());
                    // Play the video
                    const stream = ytdl(url, {filter: 'audioonly'});
                    var dispatcher = connection.playStream(stream);
                    dispatcher.on('end', () => {
                        // If the blind test wasn't already finished, we finish it
                        if(this.currentBlindTest !== null) {
                            this.result(voiceChannel);
                        }
                        voiceChannel.leave();
                    });
                }
            });

        })
        .catch(err => {
            console.log(err)
        });
    }

    result(voiceChannel) {
        try {
            var winnerId = this.currentBlindTest.computeWinner();
            this.textChannel.send("<@" + winnerId + "> win this one !");
        } catch (error) {
            if(error === "no_response") {
                this.textChannel.send("No submitions, no winners !");
            } else {
                console.log(error);
            }
        }
        this.textChannel.send("The video was **" + this.currentBlindTest.videoName + "**");

        this.textChannel = null;
        this.currentBlindTest = null;
        if(voiceChannel.connection) {
            voiceChannel.connection.disconnect();
        }
    }

    guess(authorId, response) {
        this.currentBlindTest.addResponse(authorId, response.toLowerCase());
    }
}

module.exports = BlindTestListener;