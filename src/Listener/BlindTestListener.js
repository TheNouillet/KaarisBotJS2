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
                                this.renderAndReply(msg, "blind_test/join_channel.txt");
                            } else if(this.currentBlindTest != null) {
                                this.renderAndReply(msg, "blind_test/bt_occuring.txt");
                            } else {
                                this.propose(parameter, voiceChannel, msg.channel);
                            }
                        });
                        break;
                    case "guess":
                        if(this.currentBlindTest == null) {
                            this.renderAndReply(msg, "blind_test/no_bt.txt");
                        } else {
                            var responseArray = commandArray.slice(2);
                            var response = responseArray.join(" ");
                            this.guess(msg.author.id, response);
                        }
                        break;
                    default:
                        this.renderAndReply(msg, "blind_test/help.txt", {
                            specialCharacter: this.commandService.specialCharacter
                        });
                        break;
                }
            } else if(commandArray.length > 1) {
                var command = commandArray[1];
                switch (command) {
                    case "result":
                        var voiceChannel = msg.member.voiceChannel;
                        if(this.currentBlindTest == null) {
                            this.renderAndReply(msg, "blind_test/no_bt.txt");
                        } else if(!voiceChannel) {
                            this.renderAndReply(msg, "blind_test/join_channel.txt");
                        } else {
                            this.result(msg.member.voiceChannel);
                        }
                        break;
                    default:
                        this.renderAndReply(msg, "blind_test/help.txt", {
                            specialCharacter: this.commandService.specialCharacter
                        });
                        break;
                }
            } else {
                this.renderAndReply(msg, "blind_test/help.txt", {
                    specialCharacter: this.commandService.specialCharacter
                });
            }
        }
    }

    propose(videoId, voiceChannel, textChannel) {
        const url = "https://www.youtube.com/watch?v=" + videoId;
        // We fetch the video info to get the name, then we can play the video
        // (provided nothing has gone wrong)
        ytdl.getInfo(url, (err, info) => {
            if(err) {
                console.log(err);
                this.renderAndSend(textChannel, "blind_text/error.txt");
            } else {
                voiceChannel.join()
                .then(connection => {
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
                })
                .catch(err => {
                    console.log(err)
                });
            }
        });
    }

    result(voiceChannel) {
        var winnerId = null;
        try {
            var winnerId = this.currentBlindTest.computeWinner();
        } catch (error) {
            if(error !== "no_response") {
                console.log(error);
            }
        }
        this.renderAndSend(this.textChannel, "blind_test/result.txt", {
            winner: winnerId,
            videoName: this.currentBlindTest.videoName
        });

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