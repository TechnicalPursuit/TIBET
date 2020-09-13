(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var fullpath;

        make.log('removing generated documentation...');

        fullpath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'doc', 'html');
        if (make.sh.test('-d', fullpath)) {
            make.sh.rm('-rf', make.CLI.joinPaths(fullpath, '*'));
        }

        fullpath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'doc', 'man');
        if (make.sh.test('-d', fullpath)) {
            make.sh.rm('-rf', make.CLI.joinPaths(fullpath, '*'));
        }

        resolve();
    };

}());
