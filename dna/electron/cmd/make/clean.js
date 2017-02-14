(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var dir;

        make.log('removing build artifacts...');

        dir = make.CLI.expandPath('~app_build');
        if (make.sh.test('-d', dir)) {
            make.sh.rm('-rf', make.path.join(dir, '*'));
        }

        dir = make.CLI.expandPath('~app_log');
        if (make.sh.test('-d', dir)) {
            make.sh.rm('-rf', make.path.join(dir, '*'));
        }

        resolve();
    };

}());
