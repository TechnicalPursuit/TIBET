/**
 * @copyright Copyright (C) \{{year}}, the AUTHORS. All Rights Reserved.
 */

(function() {
    'use strict';

    var release;

    release = TP && TP.sys && TP.sys.release ? TP.sys.release :
        (data) => {
            module.exports = data;
        };

    //  --- latest.js start ---
    /* eslint-disable quote-props,quotes */
    release({
        //  new release
        "semver": "\{{semver}}",
        "major": "\{{major}}",
        "minor": "\{{minor}}",
        "patch": "\{{patch}}",
        "suffix": "\{{suffix}}",
        "increment": "\{{increment}}",
        "time": "\{{time}}",
        //  prior semver
        "describe": "\{{describe}}",
        "ptag": "\{{ptag}}",
        "commits": "\{{commits}}",
        "phash": "\{{phash}}"
    },
    'app');
    /* eslint-enable quote-props,quotes */
    //  --- latest.js end ---

}());
