(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jsonpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'jsonpath'));

        make.sh.exec('cp -f ./jsonpath.js ../../deps/jsonpath-tpi.js');
        make.sh.exec('cp -f ./jsonpath.min.js ../../deps/jsonpath-tpi.min.js');

        resolve();
    };

}());
