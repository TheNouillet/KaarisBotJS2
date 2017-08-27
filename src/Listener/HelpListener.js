"use strict";

const Listener = require("../Listener");
const CommandService = require('../Utils/CommandService');
const ThemeService = require('../Utils/ThemeService');

class HelpListener extends Listener {
    constructor(fileMap) {
        super();

        this.fileMap = fileMap;
        this.commandService = new CommandService();
        this.themeService = new ThemeService();
    }

    getMessageContent(themeAlias) {
        if(this.fileMap.length == 0) {
            return "There is no theme configured !";
        }
        var content = "";
        if(themeAlias == undefined) {
            content = this.getGeneralHelpMessageContent();
            content += this.getAdditionalContent();
        }
        else {
            content = this.getSpecificHelpMessageContent(themeAlias);
        }
        return content;
    }

    getGeneralHelpMessageContent() {
        var content = "Here are the available themes :\n";
        this.fileMap.forEach( theme => {
            var line = "- ";
            if(theme.isRestricted()) {
                line += "*";
            }
            line += theme.aliases.join(" / ");
            if(theme.isRestricted()) {
                line += "*";
            }
            content += line + "\n";
        });
        
        content += "Type \"" + this.commandService.specialCharacter + "help <theme>\" to know more\n";
        return content;
    }

    getSpecificHelpMessageContent(themeAlias) {
        var theme = this.themeService.getThemeByName(this.fileMap, themeAlias);
        if(theme == null) {
            return "Theme \"" + themeAlias + "\" not found";
        }

        var content = "Here are the available commands for the theme \"" + themeAlias + "\" :\n";
        theme.commands.forEach(cmd => {
            content += "- " + cmd.name + "\n";
        });

        if(theme.isRestricted()) {
            content += "This theme is restricted to : \n";
            theme.allowedIds.forEach( (id) => {
                content += "<@" + id + ">\n";
            });
        }

        return content;
    }

    getAdditionalContent() {
        var content = "Type \"" + this.commandService.specialCharacter + "random\" to get help for the Random feature\n";
        content += "Type \"" + this.commandService.specialCharacter + "bt\" to get help for the Blind Test feature\n";
        return content;
    }

    onNotify(msg) {
        var commandArray = this.commandService.parseCommand(msg);
        if(commandArray !== null && commandArray[0] == "help") {
            var msgContent = this.getMessageContent(commandArray[1]);
            msg.reply(msgContent);
        }
    }
}

module.exports = HelpListener;