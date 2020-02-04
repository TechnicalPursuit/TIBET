(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'moment'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'moment.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'moment-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'min', 'moment.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'moment-tpi.min.js'));

        resolve();
    };

}());
