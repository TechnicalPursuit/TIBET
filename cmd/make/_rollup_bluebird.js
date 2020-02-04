(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update bluebird');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'bluebird'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'js', 'browser', 'bluebird.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'bluebird-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'js', 'browser', 'bluebird.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'bluebird-tpi.min.js'));

        resolve();
    };

}());
