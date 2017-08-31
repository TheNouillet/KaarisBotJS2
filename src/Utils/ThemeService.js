"use strict";

var fs = require('fs');
var inspect = require('eyes').inspector({maxLength: false});
var xml2js = require('xml2js');

const Theme = require('../Model/Theme');
const Command = require('../Model/Command');

class ThemeService {

    /**
     * Parse an XML file to extract a command map. The array consists of Theme and Command classes instances.
     * 
     * @param string fileName 
     * @returns array
     * @memberof ThemeService
     * @throws not_exist If the given file doesn't exist
     */
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

    /**
     * Convert a parsed XML string to a Theme instance
     * 
     * @param string theme 
     * @returns Theme
     * @memberof ThemeService
     */
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

    /**
     * Get a theme from the map, by its name.
     * 
     * @param array commandMap 
     * @param string themeName 
     * @returns Theme|null
     * @memberof ThemeService
     */
    getThemeByName(commandMap, themeName) {
        var theme = null;
        commandMap.forEach(thm => {
            if(thm.aliases.includes(themeName)) {
                theme = thm;
            }
        });
        return theme;
    }

    /**
     * Get a command from a theme. Check the message author permissions on the theme
     * 
     * @param array commandMap 
     * @param string themeName 
     * @param string commandName 
     * @param integer authorId 
     * @returns Command|null
     * @memberof ThemeService
     * @throws no_theme If there is no theme named that way
     * @throws not_allowed If the author is not allowed to use the theme
     */
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


    /**
     * Get a random command from a theme. Check the message author permissions on the theme.
     * 
     * @param array commandMap 
     * @param string themeName 
     * @param integer authorId 
     * @returns Command|null
     * @memberof ThemeService
     * @throws no_theme If there is no theme named that way
     * @throws not_allowed If the author is not allowed to use the theme
     */
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