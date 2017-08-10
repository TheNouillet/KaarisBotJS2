const Discord = require('discord.js');
var inspect = require('eyes').inspector({ maxLength: false });
var parser = require("./parser");
// const AudioListener = require("./lib/Listener/AudioListener");
const HelpListener = require("./lib/Listener/HelpListener");

const client = new Discord.Client();
var botToken = process.argv[2];
var specialCharacter = '!';
var fileMap = parser.get();

client.on('ready', () => {
    client.messageListeners = [];
    // client.messageListeners.push(new AudioListener(fileMap, specialCharacter));
    client.messageListeners.push(new HelpListener(fileMap, specialCharacter));
    console.log('Ready!');
});
client.on('message', message => {
    client.messageListeners.forEach(function (listener) {
        listener.notify(message);
    });
});
client.login(botToken);