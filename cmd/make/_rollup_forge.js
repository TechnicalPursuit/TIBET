(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update forge');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'node-forge'));

        make.sh.exec('npm install -d');

        make.sh.exec('npm run minify');
        make.sh.exec('cp -f js/forge.min.js ../../deps/forge-tpi.min.js');

        resolve();
    };

}());
