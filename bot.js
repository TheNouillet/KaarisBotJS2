const Discord = require('discord.js');
var inspect = require('eyes').inspector({maxLength: false});

const AudioListener = require("./src/Listener/AudioListener");
const HelpListener = require("./src/Listener/HelpListener");
const RandomListener = require("./src/Listener/RandomListener");
const BlindTestListener = require("./src/Listener/BlindTestListener");
const ThemeService = require('./src/Utils/ThemeService');

const client = new Discord.Client();
var botToken = process.argv[2];
var fileMap = null;
try {
    fileMap = new ThemeService().parseCommandFile(__dirname + '/config/cmds.xml');
} catch (error) {
    if(error == "not_exist") {
        console.log("Warning : the config/cmds.xml doesn't exist.");
        console.log("Make sure to make a copy of config/cmds.dist.xml, and make your own commands.");
        console.log("For now, the audio feature will be disabled. You can still use the others.");
    }
}

client.canBroadcast = true;
client.on('ready', () => {
    client.messageListeners = [];
    client.messageListeners.push(new BlindTestListener());
    client.messageListeners.push(new AudioListener(fileMap));
    client.messageListeners.push(new HelpListener(fileMap));
    client.messageListeners.push(new RandomListener());
    console.log('Ready!');
});
client.on('message', message => {
    client.messageListeners.forEach(function (listener) {
        listener.notify(message);
    });
});
client.login(botToken);