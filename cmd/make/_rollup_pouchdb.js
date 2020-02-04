(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        /*
        NOTE: Since we switched packages to 'pouchdb-browser', these build
        instructions are no longer relevant. SEE BELOW.

        var npmdir;

        make.sh.exec('npm update pouchdb');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'pouchdb'));

        make.sh.exec('cp -f dist/pouchdb.js ../../deps/pouchdb-tpi.js');
        make.sh.exec('cp -f dist/pouchdb.min.js ../../deps/pouchdb-tpi.min.js');

        Unfortunately, the prebuilt pouchdb-browser package doesn't have a
        prebuild 'dist' directory and has no mechanism for building one.
        Therefore, it is necessary to follow these steps *OUTSIDE* of any
        'node_modules' directory:

        # Clone the main PouchBD repository
        git clone https://github.com/pouchdb/pouchdb

        # cd into pouchdb
        cd pouchdb

        # Run npm install. This will build the dist packages for PouchDB.
        npm install

        # Copy the packages meant for the browser from the 'packages' directory
        # into the TIBET deps directory. NOTE: You may have to adjust the target
        # directory to point to your TIBET repository.
        cp ./packages/node_modules/pouchdb/dist/pouchdb.js /usr/local/src/TPI/TIBET/deps/pouchdb-tpi.js
        cp ./packages/node_modules/pouchdb/dist/pouchdb.min.js /usr/local/src/TPI/TIBET/deps/pouchdb-tpi.min.js
        */

        resolve();
    };

}());
