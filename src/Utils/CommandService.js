"use strict";

class CommandService {
    constructor() {
        this.specialCharacter = "!";
    }


    /**
     * Transform a message into a command array, without the special character 
     * 
     * @param string message The message to parse
     * @returns string|null Returns the parsed message content, or null if the message doesn't begin with the special character
     * @memberof CommandService
     */
    parseCommand(message) {
        if (message.content[0] === this.specialCharacter) {
            var strippedMessage = message.content.substr(1);
            return strippedMessage.split(" ");
        } else {
            // The command doesn't begins with the special character
            return null;
        }
    }


    /**
     * Returns the levenshtein distance of 2 strings.
     * Taken from here : https://gist.github.com/andrei-m/982927
     * 
     * @param string a 
     * @param string b 
     * @returns The edit distance between 2 strings
     * @memberof CommandService
     */
    levenshteinDistance(a, b) {
        if (a.length == 0) return b.length;
        if (b.length == 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    }
}

module.exports = CommandService;