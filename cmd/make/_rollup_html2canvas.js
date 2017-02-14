(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update html2canvas');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'html2canvas'));

        make.sh.exec('cp -f dist/html2canvas.js  ../../deps/html2canvas-tpi.js');
        make.sh.exec('cp -f dist/html2canvas.min.js  ../../deps/html2canvas-tpi.min.js');

        resolve();
    };

}());
