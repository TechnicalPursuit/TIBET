(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jquery');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'jquery'));

        // TODO: build and copy jquery build output to the proper location(s)

        resolve();
    };

}());
