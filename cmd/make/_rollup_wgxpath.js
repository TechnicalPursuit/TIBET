(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update wicked-good-xpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'wicked-good-xpath'));

        make.sh.exec('cp -f dist/wgxpath.install.js ../../deps/wgxpath-tpi.install.min.js');

        resolve();
    };

}());
