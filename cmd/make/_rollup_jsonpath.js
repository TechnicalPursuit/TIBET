(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jsonpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'jsonpath'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'jsonpath.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'jsonpath-tpi.js'));

        resolve();
    };

}());
