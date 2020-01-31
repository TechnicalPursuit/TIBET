(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update diff');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'diff'));

        make.sh.sed('-i', /\/\/# sourceMappingURL/g,
            '\n//**no source maps!**', './dist/diff.js');

        make.sh.cp(
            make.path.join('.', 'dist', 'diff.js'),
            make.path.join('..', '..', 'deps', 'diff-tpi.js'));

        make.sh.cp(
            make.path.join('.', 'dist', 'diff.min.js'),
            make.path.join('..', '..', 'deps', 'diff-tpi.min.js'));

        resolve();
    };

}());
