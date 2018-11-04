(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update resize-observer-polyfill');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'resize-observer-polyfill'));

        make.sh.exec('cp -f -R dist/ResizeObserver.js ../../deps/resize-observer-tpi.js');

        resolve();
    };

}());
