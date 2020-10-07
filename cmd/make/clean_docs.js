(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var CLI,
            fullpath;

        make.log('removing generated docs...');

        CLI = make.CLI;

        fullpath = make.CLI.joinPaths(CLI.expandPath('~'), 'doc', 'html');
        if (make.sh.test('-d', fullpath)) {
            make.sh.rm('-rf', make.CLI.joinPaths(fullpath, '*'));
        }

        fullpath = make.CLI.joinPaths(CLI.expandPath('~'), 'doc', 'man');
        if (make.sh.test('-d', fullpath)) {
            make.sh.rm('-rf', make.CLI.joinPaths(fullpath, '*'));
        }

        resolve();
    };

}());
