(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jjv');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'jjv'));

        //  Need this to build minified jjv package
        make.sh.exec('npm install -d');

        make.sh.cp(
            make.path.join('.', 'lib', 'jjv.js'),
            make.path.join('..', '..', 'deps', 'jjv-tpi.js'));

        make.sh.cp(
            make.path.join('.', 'build', 'jjv.min.js'),
            make.path.join('..', '..', 'deps', 'jjv-tpi.min.js'));

        resolve();
    };

}());
