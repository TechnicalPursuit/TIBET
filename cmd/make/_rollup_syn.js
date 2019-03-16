(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'syn'));

        make.sh.exec('cp -f ./dist/global/syn.js ../../deps/syn-tpi.js');

        resolve();
    };

}());
