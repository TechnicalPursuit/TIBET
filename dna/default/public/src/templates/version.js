/**
 * @copyright Copyright (C) 2020, the AUTHORS. All Rights Reserved.
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
        "semver": "0.1.0",
        "major": "0",
        "minor": "1",
        "patch": "0",
        "suffix": "dev",
        "increment": "0",
        "time": "",
        //  prior semver
        "describe": "",
        "ptag": "",
        "commits": "",
        "phash": ""
    },
    'app');
    /* eslint-enable quote-props,quotes */
    //  --- latest.js end ---

}());
