"use strict";

const CommandService = require('../Utils/CommandService');

class BlindTest {
    constructor(videoName) {
        this.commandService = new CommandService();
        this.videoName = videoName;
        this.responses = [];
    }

    addResponse(authorId, guess) {
        var date = new Date();
        this.responses.push({
            authorId:  authorId,
            guess:     guess,
            date:      date.getTime()
        });
    }

    computeWinner() {
        // If there is no response, we throw an exception
        if(this.responses.length === 0) {
            throw "no_response";
        }

        // We compute all distances
        var scores = [];
        this.responses.forEach(response => {
            scores.push({
                authorId: response.authorId,
                distance: this.commandService.levenshteinDistance(response.guess, this.videoName),
                date:     response.date
            })
        });

        // Then we get the response with the minimal distance (the date will break ties)
        var winner = scores[0];
        scores.slice(1).forEach(score => {
            if(score.distance < winner.distance ||
               (score.distance == winner.distance && score.date < winner.date)) {
                winner = score;
            }
        });

        // We can now return the winner id
        return winner.authorId;
    }
}

module.exports = BlindTest;