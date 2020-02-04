(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update diff');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'diff'));

        make.sh.sed('-i', /\/\/# sourceMappingURL/g,
            '\n//**no source maps!**', './dist/diff.js');

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'diff.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'diff-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'diff.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'diff-tpi.min.js'));

        resolve();
    };

}());
