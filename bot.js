const Discord = require('discord.js');

const AudioListener = require("./src/Listener/AudioListener");
const HelpListener = require("./src/Listener/HelpListener");
const ThemeService = require('./src/Utils/ThemeService');

const client = new Discord.Client();
var botToken = process.argv[2];
var fileMap = new ThemeService().parseCommandFile(__dirname + '/cmds.xml');

client.canBroadcast = true;
client.on('ready', () => {
    client.messageListeners = [];
    client.messageListeners.push(new AudioListener(fileMap));
    client.messageListeners.push(new HelpListener(fileMap));
    console.log('Ready!');
});
client.on('message', message => {
    client.messageListeners.forEach(function (listener) {
        listener.notify(message);
    });
});
client.login(botToken);