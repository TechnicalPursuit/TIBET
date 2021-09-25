(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.log('\n\nrolling up pouchdb-all-dbs...\n\n');

        make.sh.exec('npm update pouchdb-all-dbs');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'pouchdb-all-dbs'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'pouchdb.all-dbs.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'pouchdb.all-dbs-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'pouchdb.all-dbs.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'pouchdb.all-dbs-tpi.min.js'));

        resolve();
    };

}());
