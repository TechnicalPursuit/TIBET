(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update pouchdb-all-dbs');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'pouchdb-all-dbs'));

        make.sh.exec(
            'cp -f dist/pouchdb.all-dbs.js ../../deps/pouchdb.all-dbs-tpi.js');
        make.sh.exec(
            'cp -f dist/pouchdb.all-dbs.min.js ../../deps/pouchdb.all-dbs-tpi.min.js');

        resolve();
    };

}());
