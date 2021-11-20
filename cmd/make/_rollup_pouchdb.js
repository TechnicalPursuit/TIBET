(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var CLI,
            sh,

            clonedir,
            pouchdbdepsdir;

        make.log('\n\nrolling up PouchDB...\n\n');

        CLI = make.CLI;
        sh = make.sh;

        clonedir = sh.tempdir();
        sh.cd(clonedir);

        sh.rm('-rf', 'pouchdb');

        make.log('\n\ncloning PouchDB repository...\n\n');

        sh.exec('git clone https://github.com/pouchdb/pouchdb.git');
        sh.cd('pouchdb');

        make.log('\n\nbuilding PouchDB release...\n\n');

        sh.exec('npm install');

        clonedir = sh.pwd().toString();

        pouchdbdepsdir = CLI.joinPaths(CLI.getLibRoot(), 'deps');

        if (!sh.test('-d', pouchdbdepsdir)) {
            sh.mkdir(pouchdbdepsdir);
        }

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir,
                            'packages', 'node_modules', 'pouchdb', 'dist',
                            'pouchdb.js'),
            CLI.joinPaths(pouchdbdepsdir, 'pouchdb-tpi.js'));

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir,
                            'packages', 'node_modules', 'pouchdb', 'dist',
                            'pouchdb.min.js'),
            CLI.joinPaths(pouchdbdepsdir, 'pouchdb-tpi.min.js'));

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir,
                            'packages', 'node_modules', 'pouchdb', 'dist',
                            'pouchdb.indexeddb.js'),
            CLI.joinPaths(pouchdbdepsdir, 'pouchdb-indexeddb-tpi.js'));

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir,
                            'packages', 'node_modules', 'pouchdb', 'dist',
                            'pouchdb.indexeddb.min.js'),
            CLI.joinPaths(pouchdbdepsdir, 'pouchdb-indexeddb-tpi.min.js'));

        resolve();
    };

}());
