(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update sinon');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'sinon'));

        make.sh.exec('cp -f ./pkg/sinon-no-sourcemaps.js ../../deps/sinon-tpi.js');

        resolve();
    };

}());
