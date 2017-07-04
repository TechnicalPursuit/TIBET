(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update xpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'xpath.js'));

        make.sh.exec('cp -f xpath.js ../../deps/xpath-tpi.js');

        resolve();
    };

}());
