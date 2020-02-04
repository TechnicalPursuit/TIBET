(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update fuse.js');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'fuse.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'fuse.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'fuse-tpi.js'));

        resolve();
    };

}());
