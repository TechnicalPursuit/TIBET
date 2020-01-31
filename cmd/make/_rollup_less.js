(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update less');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'less'));

        make.sh.cp(
            make.path.join('.', 'dist', 'less.js'),
            make.path.join('..', '..', 'deps', 'less-tpi.js'));

        make.sh.cp(
            make.path.join('.', 'dist', 'less.min.js'),
            make.path.join('..', '..', 'deps', 'less-tpi.min.js'));

        resolve();
    };

}());
