/**
 * @copyright Copyright (C) {{year}}, the AUTHORS. All Rights Reserved.
 */

(function() {
    var release;

    release = TP.sys.release;

    //  --- latest.js start ---
    /* eslint-disable quote-props,quotes */
    release({
        //  new release
        "semver": "{{semver}}",
        "major": "{{major}}",
        "minor": "{{minor}}",
        "patch": "{{patch}}",
        "suffix": "{{suffix}}",
        "increment": "{{increment}}",
        "time": "{{time}}",
        //  prior semver
        "describe": "{{describe}}",
        "ptag": "{{ptag}}",
        "commits": "{{commits}}",
        "phash": "{{phash}}"
    },
    'app');
    /* eslint-enable quote-props,quotes */
    //  --- latest.js end ---

}());
