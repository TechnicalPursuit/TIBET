(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');

        make.sh.exec('npm update d3-selection');
        make.sh.exec('npm update d3-interpolate');
        make.sh.exec('npm update d3-dispatch');

        make.sh.cd(make.path.join(npmdir, 'd3-selection'));
        make.sh.exec('cp -f ./dist/d3-selection.js ../../deps/d3-selection-tpi.js');
        make.sh.exec('cp -f ./dist/d3-selection.min.js ../../deps/d3-selection-tpi.min.js');

        make.sh.cd('../d3-interpolate');
        make.sh.exec('cp -f ./dist/d3-interpolate.js ../../deps/d3-interpolate-tpi.js');
        make.sh.exec('cp -f ./dist/d3-interpolate.min.js ../../deps/d3-interpolate-tpi.min.js');

        make.sh.cd('../d3-dispatch');
        make.sh.exec('cp -f ./dist/d3-dispatch.js ../../deps/d3-dispatch-tpi.js');
        make.sh.exec('cp -f ./dist/d3-dispatch.min.js ../../deps/d3-dispatch-tpi.min.js');

        resolve();
    };

}());
