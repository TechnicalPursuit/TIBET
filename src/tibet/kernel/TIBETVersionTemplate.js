(function() {
    var release = TP.sys.release;
    /* eslint-disable */

    //  --- latest.js content ---
    release({
        "name": "{{name}}",
        "major": "{{major}}",
        "minor": "{{minor}}",
        "patch": "{{patch}}",
        "state": "{{state}}",
        "root": "{{describe}}",
        "date": "{{isodate}}"
    });
    //  --- end latest.js ---

}());
