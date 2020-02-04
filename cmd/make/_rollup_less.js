(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update less');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'less'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'less.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'less-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'less.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'less-tpi.min.js'));

        resolve();
    };

}());
