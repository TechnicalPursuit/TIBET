(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'mutation-summary'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'src', 'mutation-summary.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'mutation-summary-tpi.js'));

        resolve();
    };

}());
