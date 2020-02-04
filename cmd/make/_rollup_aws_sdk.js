(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update aws-sdk');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'aws-sdk'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'aws-sdk.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'aws-sdk-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'aws-sdk.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'aws-sdk-tpi.min.js'));

        resolve();
    };

}());
