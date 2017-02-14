(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update less');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'less'));

        make.sh.exec('cp -f dist/less.js  ../../deps/less-tpi.js');
        make.sh.exec('cp -f dist/less.min.js  ../../deps/less-tpi.min.js');

        resolve();
    };

}());
