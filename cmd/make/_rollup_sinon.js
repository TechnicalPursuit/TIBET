(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update sinon');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'sinon'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'pkg', 'sinon-no-sourcemaps.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'sinon-tpi.js'));

        resolve();
    };

}());
