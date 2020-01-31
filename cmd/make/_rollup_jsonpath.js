(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jsonpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'jsonpath'));

        make.sh.cp(
            make.path.join('.', 'jsonpath.js'),
            make.path.join('..', '..', 'deps', 'jsonpath-tpi.js'));

        resolve();
    };

}());
