(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jjv');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'jjv'));

        //  Need this to build minified jjv package
        make.sh.exec('npm install -d');

        make.sh.exec('cp -f lib/jjv.js  ../../deps/jjv-tpi.js');
        make.sh.exec('cp -f build/jjv.min.js  ../../deps/jjv-tpi.min.js');

        resolve();
    };

}());
