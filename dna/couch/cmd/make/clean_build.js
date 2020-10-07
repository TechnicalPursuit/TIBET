(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var fullpath;

        make.log('removing build dir content...');

        try {
            fullpath = make.CLI.expandPath('~app_build');
            if (make.sh.test('-d', fullpath)) {
                make.sh.rm('-rf', make.CLI.joinPaths(fullpath, '*'));
            }
        } catch (e) {
            reject(e);
        }

        resolve();
    };

}());
