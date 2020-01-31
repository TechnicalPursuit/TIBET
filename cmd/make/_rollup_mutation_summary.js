(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'mutation-summary'));

        make.sh.cp(
            make.path.join('.', 'src', 'mutation-summary.js'),
            make.path.join('..', '..', 'deps', 'mutation-summary-tpi.js'));

        resolve();
    };

}());
