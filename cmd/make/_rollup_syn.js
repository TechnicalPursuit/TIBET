(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update syn');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'syn'));

        //  Need this to build minified syn package
        make.sh.exec('npm install -d');

        make.sh.exec('grunt build');
        make.sh.exec('cp -f ./dist/syn.js ../../deps/syn-tpi.js');
        make.sh.exec('cp -f ./dist/syn.min.js ../../deps/syn-tpi.min.js');

        resolve();
    };

}());
