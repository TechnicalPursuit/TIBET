(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.log('\n\nrolling up systemjs...\n\n');

        make.sh.exec('npm update systemjs');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'systemjs'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'system.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'systemjs-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'system.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'systemjs-tpi.min.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'extras', 'named-register.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'systemjs-named-register-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'extras', 'named-register.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'systemjs-named-register-tpi.min.js'));

        resolve();
    };

}());
