(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var tmpdir,
            err;

        make.log('emptying rollup cache...');

        //  Grab the temp directory path that we're going to use as the build
        //  cache (and create it if it's not there).
        tmpdir = make.CLI.joinPaths(make.sh.tempdir(),
            make.getcfg('tibet.rollup_cache'));

        if (make.sh.test('-d', tmpdir)) {
            //  Empty the cache directory before we start processing files.
            err = make.sh.rm('-rf', tmpdir);
            if (make.sh.error()) {
                make.error('Error removing cache directory: ' + err.stderr);
                reject();
                return;
            }
        }

        resolve();
    };

}());
