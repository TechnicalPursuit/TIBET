(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update bluebird');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'bluebird'));

        make.sh.exec('cp -f js/browser/bluebird.js  ../../deps/bluebird-tpi.js');
        make.sh.exec('cp -f js/browser/bluebird.min.js  ../../deps/bluebird-tpi.min.js');

        resolve();
    };

}());
