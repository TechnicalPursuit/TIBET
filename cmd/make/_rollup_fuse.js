(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update fuse.js');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'fuse.js'));

        make.sh.exec('cp -f ./dist/fuse.js ../../deps/fuse-tpi.js');

        resolve();
    };

}());
