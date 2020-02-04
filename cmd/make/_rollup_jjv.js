(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jjv');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'jjv'));

        //  Need this to build minified jjv package
        make.sh.exec('npm install -d');

        make.sh.cp(
            make.CLI.joinPaths('.', 'lib', 'jjv.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'jjv-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'build', 'jjv.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'jjv-tpi.min.js'));

        resolve();
    };

}());
