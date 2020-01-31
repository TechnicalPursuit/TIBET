(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update fuse.js');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'fuse.js'));

        make.sh.cp(
            make.path.join('.', 'dist', 'fuse.js'),
            make.path.join('..', '..', 'deps', 'fuse-tpi.js'));

        resolve();
    };

}());
