(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'moment'));

        make.sh.cp(
            make.path.join('.', 'moment.js'),
            make.path.join('..', '..', 'deps', 'moment-tpi.js'));

        make.sh.cp(
            make.path.join('.', 'min', 'moment.min.js'),
            make.path.join('..', '..', 'deps', 'moment-tpi.min.js'));

        resolve();
    };

}());
