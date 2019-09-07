(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'mutation-summary'));

        make.sh.exec('cp -f ./src/mutation-summary.js ../../deps/mutation-summary-tpi.js');

        resolve();
    };

}());
