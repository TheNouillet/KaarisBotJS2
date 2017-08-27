"use strict";

class Theme {
    constructor() {
        this.aliases = [];
        this.commands = [];
        this.allowedIds = [];
    }

    isRestricted() {
        return this.allowedIds.length > 0;
    }

    addAlias(alias) {
        this.aliases.push(alias);
    }
    addCommand(command) {
        this.commands.push(command);
    }
    addAllowedId(allowedId) {
        this.allowedIds.push(allowedId);
    }
}

module.exports = Theme;