(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update bluebird');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'bluebird'));

        make.sh.cp(
            make.path.join('.', 'js', 'browser', 'bluebird.js'),
            make.path.join('..', '..', 'deps', 'bluebird-tpi.js'));

        make.sh.cp(
            make.path.join('.', 'js', 'browser', 'bluebird.min.js'),
            make.path.join('..', '..', 'deps', 'bluebird-tpi.min.js'));

        resolve();
    };

}());
