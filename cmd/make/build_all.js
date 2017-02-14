(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var fullpath;

        make.log('building all packages...');

        fullpath = make.path.join(make.CLI.expandPath('~'), 'lib', 'src');
        if (!make.sh.test('-d', fullpath)) {
            make.sh.mkdir(fullpath);
        }

        make.chain('clean', '_lint', 'build_deps', 'build_tibet').then(
            resolve, reject);
    };

}());
