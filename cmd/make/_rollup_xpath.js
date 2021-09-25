(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.log('\n\nrolling up xpath...\n\n');

        make.sh.exec('npm update xpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'xpath.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'xpath.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'xpath-tpi.js'));

        resolve();
    };

}());
