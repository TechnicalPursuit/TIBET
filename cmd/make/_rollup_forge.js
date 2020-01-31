(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update node-forge');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'node-forge'));

        make.sh.cp(
            make.path.join('.', 'dist', 'forge.min.js'),
            make.path.join('..', '..', 'deps', 'forge-tpi.min.js'));

        resolve();
    };

}());
