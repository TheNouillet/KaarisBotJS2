var fs = require('fs');
var inspect = require('eyes').inspector({maxLength: false});
var xml2js = require('xml2js');

module.exports = {
    get: function() {
        var parser = new xml2js.Parser();
        var data = fs.readFileSync(__dirname + '/cmds.xml');
        var map = [];
        parser.parseString(data, function (err, result) {
            //inspect(result);
            var themes = result.commands.theme;
            console.log('Done parsing, found ' + themes.length + ' themes');
            
            themes.forEach(function(theme) {
                var themeMap = [];
                themeMap['aliases'] = [];
                themeMap['commands'] = [];
                
                // On recupère d'abord les alias
                theme.name.forEach(function(name) {
                    themeMap['aliases'].push(name.$.value);
                    //console.log("Ajout alias : " + name.$.value);
                });

                // On récupère ensuite les utilisateurs autorisés
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

                // On récupère ensuite les fichiers avec leurs commandes
                theme.audio.forEach(function(audio) {
                    themeMap['commands'][audio.$.name] = audio.$.file;
                    //console.log("Ajout commande : " + audio.$.name + " / " + audio.$.file);
                });
                
                map.push(themeMap);
            });
        });
        return map;
    }
};