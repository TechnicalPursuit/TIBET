(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update aws-sdk');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'aws-sdk'));

        make.sh.exec('cp -f ./dist/aws-sdk.js ../../deps/aws-sdk-tpi.js');
        make.sh.exec('cp -f ./dist/aws-sdk.min.js ../../deps/aws-sdk-tpi.min.js');

        resolve();
    };

}());
