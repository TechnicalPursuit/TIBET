(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jsforce');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'jsforce'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'build', 'jsforce.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'jsforce-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'build', 'jsforce.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'jsforce-tpi.min.js'));

        resolve();
    };

}());
