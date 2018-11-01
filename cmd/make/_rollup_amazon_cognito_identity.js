(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update amazon-cognito-identity-js');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'amazon-cognito-identity-js'));

        make.sh.exec('cp -f ./dist/amazon-cognito-identity.js ../../deps/amazon-cognito-identity-tpi.js');
        make.sh.exec('cp -f ./dist/amazon-cognito-identity.min.js ../../deps/amazon-cognito-identity-tpi.min.js');

        resolve();
    };

}());
