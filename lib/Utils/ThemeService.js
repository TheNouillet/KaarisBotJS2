"use strict";

var fs = require('fs');
var inspect = require('eyes').inspector({maxLength: false});
var xml2js = require('xml2js');

class ThemeService {

    parseCommandFile(fileName) {
        var parser = new xml2js.Parser();
        var data = fs.readFileSync(fileName);
        var map = [];
        parser.parseString(data, function (err, result) {
            //inspect(result);
            var themes = result.commands.theme;
            console.log('Done parsing, found ' + themes.length + ' themes');
            
            themes.forEach(function(theme) {
                var themeMap = [];
                themeMap['aliases'] = [];
                themeMap['commands'] = [];
                
                // We first fetch aliases
                theme.name.forEach(function(name) {
                    themeMap['aliases'].push(name.$.value);
                });

                // Then we fetch allowed users
                if(theme.allow && theme.allow.length > 0) {
                    themeMap['restricted'] = true;
                    themeMap['allowedIds'] = []
                    theme.allow.forEach( (allow) => {
                        themeMap['allowedIds'].push(allow.$.id);
                    });
                }
                else {
                    themeMap['restricted'] = false;
                }

                // Finally, we fetch files names with their commands
                theme.audio.forEach(function(audio) {
                    themeMap['commands'][audio.$.name] = audio.$.file;
                });
                
                map.push(themeMap);
            });
        });
        return map;
    }
}

module.exports = ThemeService;