"use strict";

var fs = require('fs');
var inspect = require('eyes').inspector({maxLength: false});
var xml2js = require('xml2js');

const Theme = require('../Model/Theme');
const Command = require('../Model/Command');

class ThemeService {

    parseCommandFile(fileName) {
        // We first verify that the commands file exists
        if(!fs.existsSync(fileName)) {
            throw "not_exist";
        }
        
        var parser = new xml2js.Parser();
        var data = fs.readFileSync(fileName);
        var map = [];
        parser.parseString(data, (err, result) => {
            // inspect(result);
            var themes = result.commands.theme;
            
            themes.forEach( (theme) => {
                map.push(this.getThemeMap(theme));
            });

            console.log('Done parsing, found ' + map.length + ' themes');
        });
        return map;
    }

    getThemeMap(theme) {
        var newTheme = new Theme();
        
        // We first fetch aliases
        theme.name.forEach( name => {
            newTheme.addAlias(name.$.value);
        });

        // Then we fetch allowed users
        if(theme.allow && theme.allow.length > 0) {
            theme.allow.forEach( (allow) => {
                newTheme.addAllowedId(allow.$.id);
            });
        }

        // Finally, we fetch files names with their commands
        theme.audio.forEach(audio => {
            var newCommand = new Command(audio.$.name, audio.$.file);
            newTheme.addCommand(newCommand);
        });

        return newTheme;
    }

    getThemeByName(commandMap, themeName) {
        var theme = null;
        commandMap.forEach(thm => {
            if(thm.aliases.includes(themeName)) {
                theme = thm;
            }
        });
        return theme;
    }

    getCommand(commandMap, themeName, commandName, authorId) {
        var theme = this.getThemeByName(commandMap, themeName);
        if(theme == null) {
            throw "no_theme";
        }
        if(theme.isRestricted() && !(theme.allowedIds.includes(authorId))) {
            throw "not_allowed";
        }

        var command = null;
        theme.commands.forEach(cmd => {
            if(cmd.name === commandName) {
                command = cmd;
            }
        });

        return command;
    }

    getRandomCommand(commandMap, themeName, authorId) {
        var theme = this.getThemeByName(commandMap, themeName);
        if(theme == null) {
            throw "no_theme";
        }
        if(theme.isRestricted() && !(theme.allowedIds.includes(authorId))) {
            throw "not_allowed";
        }

        var command = null;
        if(theme.commands.length > 0) {
            command = theme.commands[Math.floor(Math.random() * theme.commands.length)];
        }

        return command;
    }
}

module.exports = ThemeService;