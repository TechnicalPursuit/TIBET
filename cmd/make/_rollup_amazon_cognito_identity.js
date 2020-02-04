(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update amazon-cognito-identity-js');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'amazon-cognito-identity-js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'amazon-cognito-identity.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'amazon-cognito-identity-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'amazon-cognito-identity.min.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'amazon-cognito-identity-tpi.min.js'));

        resolve();
    };

}());
