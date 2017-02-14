(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update pouchdb');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'pouchdb'));

        make.sh.exec('cp -f dist/pouchdb.js ../../deps/pouchdb-tpi.js');
        make.sh.exec('cp -f dist/pouchdb.min.js ../../deps/pouchdb-tpi.min.js');

        resolve();
    };

}());
