"use strict";

const Listener = require("../Listener");
const CommandService = require('../Utils/CommandService');
const ThemeService = require('../Utils/ThemeService');
const TemplateHelper = require('../Utils/TemplateHelper');

class HelpListener extends Listener {
    constructor(fileMap) {
        super();

        this.fileMap = fileMap;
        this.commandService = new CommandService();
        this.themeService = new ThemeService();
        this.templateHelper = new TemplateHelper();
    }

    onNotify(msg) {
        var commandArray = this.commandService.parseCommand(msg);
        if(commandArray !== null && commandArray[0] == "help") {
            if(this.fileMap == null || this.fileMap.length == 0) {
                this.renderAndReply(msg, 'help/no_theme_configured.txt');
                return;
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
        var themes = this.templateHelper.prepareThemes(this.fileMap);
        this.renderAndReply(originalMessage, 'help/themes.txt', {
            themes: themes,
            specialCharacter: this.commandService.specialCharacter
        });
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
            allowedUsers: this.templateHelper.prepareAllowedIds(theme)
        });
    }
}

module.exports = HelpListener;