(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'syn'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'global', 'syn.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'syn-tpi.js'));

        resolve();
    };

}());
