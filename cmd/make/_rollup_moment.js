(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'moment'));

        make.sh.exec('cp -f ./moment.js ../../deps/moment-tpi.js');
        make.sh.exec('cp -f ./min/moment.min.js ../../deps/moment-tpi.min.js');

        resolve();
    };

}());
