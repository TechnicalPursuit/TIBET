(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update sinon');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'sinon'));

        make.sh.cp(
            make.path.join('.', 'pkg', 'sinon-no-sourcemaps.js'),
            make.path.join('..', '..', 'deps', 'sinon-tpi.js'));

        resolve();
    };

}());
