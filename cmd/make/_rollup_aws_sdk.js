(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update aws-sdk');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'aws-sdk'));

        make.sh.cp(
            make.path.join('.', 'dist', 'aws-sdk.js'),
            make.path.join('..', '..', 'deps', 'aws-sdk-tpi.js'));

        make.sh.cp(
            make.path.join('.', 'dist', 'aws-sdk.min.js'),
            make.path.join('..', '..', 'deps', 'aws-sdk-tpi.min.js'));

        resolve();
    };

}());
