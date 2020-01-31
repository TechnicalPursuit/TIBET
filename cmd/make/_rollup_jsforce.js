(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jsforce');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'jsforce'));

        make.sh.cp(
            make.path.join('.', 'build', 'jsforce.js'),
            make.path.join('..', '..', 'deps', 'jsforce-tpi.js'));

        make.sh.cp(
            make.path.join('.', 'build', 'jsforce.min.js'),
            make.path.join('..', '..', 'deps', 'jsforce-tpi.min.js'));

        resolve();
    };

}());
