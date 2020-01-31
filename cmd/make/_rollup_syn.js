(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'syn'));

        make.sh.cp(
            make.path.join('.', 'dist', 'global', 'syn.js'),
            make.path.join('..', '..', 'deps', 'syn-tpi.js'));

        resolve();
    };

}());
