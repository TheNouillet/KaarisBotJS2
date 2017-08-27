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

    onNotify(msg) {
        var commandArray = this.commandService.parseCommand(msg);
        if(commandArray !== null && commandArray[0] == "help") {
            if(this.fileMap.length == 0) {
                this.renderAndReply(msg, 'help/no_themes_configured.txt');
            }
            var themeAlias = commandArray[1];
            if(themeAlias == undefined) {
                this.replyThemesHelp(msg);
            }
            else {
                this.replyCommandsHelp(msg, themeAlias);
            }
        }
    }

    replyThemesHelp(originalMessage) {
        var themes = this.prepareThemes();
        this.renderAndReply(originalMessage, 'help/themes.txt', {
            themes: themes,
            specialCharacter: this.commandService.specialCharacter
        });
    }

    prepareThemes() {
        var res = [];
        this.fileMap.forEach(theme => {
            res.push({
                aliases: theme.aliases.join(" / "),
                restricted: theme.isRestricted()
            });
        });
        return res;
    }

    replyCommandsHelp(originalMessage, themeAlias) {
        var theme = this.themeService.getThemeByName(this.fileMap, themeAlias);
        if(theme == null) {
            this.renderAndReply(originalMessage, 'help/no_themes.txt', {alias: themeAlias});
        }
        this.renderAndReply(originalMessage, 'help/commands.txt', {
            alias: themeAlias,
            commands: theme.commands,
            restricted: theme.isRestricted(),
            allowedUsers: this.prepareAllowedIds(theme)
        });
    }

    prepareAllowedIds(theme) {
        var res = [];
        theme.allowedIds.forEach(id => {
            res.push({id: id});
        });
        return res;
    }
}

module.exports = HelpListener;