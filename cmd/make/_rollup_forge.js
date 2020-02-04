(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update node-forge');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'node-forge'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'forge.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'forge-tpi.min.js'));

        resolve();
    };

}());
