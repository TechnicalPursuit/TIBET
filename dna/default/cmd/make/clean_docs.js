(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var CLI,
            fullpath;

        make.log('removing generated documentation...');

        CLI = make.CLI;

        fullpath = make.path.join(CLI.expandPath('~'), 'doc', 'html');
        if (make.sh.test('-d', fullpath)) {
            make.sh.rm('-rf', make.path.join(fullpath, '*'));
        }

        fullpath = make.path.join(CLI.expandPath('~'), 'doc', 'man');
        if (make.sh.test('-d', fullpath)) {
            make.sh.rm('-rf', make.path.join(fullpath, '*'));
        }

        resolve();
    };

}());
