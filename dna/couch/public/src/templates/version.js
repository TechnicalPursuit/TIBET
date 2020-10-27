/**
 * @copyright Copyright (C) {{year}}, the AUTHORS. All Rights Reserved.
 */

(function() {
    var release;

    /* eslint-disable arrow-parens, arrow-body-style */
    release = TP.sys.release || (data => data);

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
