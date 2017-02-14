(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update d3');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'd3'));

        make.sh.exec('npm install -d');

        make.sh.exec('make');
        make.sh.exec('cp -f d3.js ../../deps/d3-tpi.js');
        make.sh.exec('cp -f d3.min.js ../../deps/d3-tpi.min.js');

        resolve();
    };

}());
