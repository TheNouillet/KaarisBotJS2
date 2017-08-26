"use strict";

const Listener = require("../Listener");
const CommandService = require('../Utils/CommandService');

class HelpListener extends Listener {
    constructor(fileMap) {
        super();

        this.fileMap = fileMap;
        this.commandService = new CommandService();
    }

    getMessageContent(map, themeAlias) {
        var content = "";
        if(themeAlias == undefined) {
            content = "Here are the available themes :\n";
            
            map.forEach(function(theme) {
                content += "- ";
                var i = 0;
                for(i = 0; i < theme.aliases.length; i++) {
                    if(theme.restricted) {
                        content += "*" + theme.aliases[i] + "*";
                    }
                    else {
                        content += theme.aliases[i];
                    }
                    if(i < theme.aliases.length - 1) {
                        content += " / ";
                    }
                }
                content += '\n';
            });
            
            content += "Type !help <theme> to know more";
        }
        else {
            var themeFound = false;
            map.forEach(function(theme) {
                theme.aliases.forEach(function(alias) {
                    if(themeAlias == alias) {
                        themeFound = true;
                        content = "Here are the available commands for the theme \"" + themeAlias + "\" :\n";
                        for(var commandName in theme.commands) {
                            content += "- " + commandName + "\n";
                        }
                        if(theme.restricted) {
                            content += "This theme is restricted to : \n";
                            theme.allowedIds.forEach( (id) => {
                                content += "<@" + id + ">\n";
                            });
                        }
                    }
                });
            });
            if(!themeFound) {
                content = "Theme \"" + themeAlias + "\" not found";
            }
        }
        return content;
    }

    onNotify(msg) {
        var commandArray = this.commandService.parseCommand(msg);
        if(commandArray !== null && commandArray[0] == "help") {
            var msgContent = this.getMessageContent(this.fileMap, commandArray[1]);
            msg.reply(msgContent);
        }
    }
}

module.exports = HelpListener;