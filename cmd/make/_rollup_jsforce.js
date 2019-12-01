(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jsforce');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'jsforce'));

        make.sh.exec('cp -f build/jsforce.js  ../../deps/jsforce-tpi.js');
        make.sh.exec('cp -f build/jsforce.min.js  ../../deps/jsforce-tpi.min.js');

        resolve();
    };

}());
