"use strict";

class TemplateHelper {

    /**
     * Prepare the filemap for the template system to render the themes list
     * 
     * @param Theme[] fileMap 
     * @returns array
     * @memberof TemplateHelper
     */
    prepareThemes(fileMap) {
        var res = [];
        fileMap.forEach(theme => {
            res.push({
                aliases: theme.aliases.join(" / "),
                restricted: theme.isRestricted()
            });
        });
        return res;
    }

    /**
     * Prepare the theme for the template system to render allowed users ids
     * 
     * @param Theme theme 
     * @returns array
     * @memberof TemplateHelper
     */
    prepareAllowedIds(theme) {
        var res = [];
        theme.allowedIds.forEach(id => {
            res.push({id: id});
        });
        return res;
    }

    /**
     * Prepare the random pool for the template system to render
     * 
     * @param array pool 
     * @memberof TemplateHelper
     * @returns array
     */
    prepareRandomPool(pool) {
        return pool.map((element) => {
            return {
                name: element
            };
        });
    }
}

module.exports = TemplateHelper;