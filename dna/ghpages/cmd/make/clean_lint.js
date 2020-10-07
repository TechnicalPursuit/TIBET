(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var fullpath;

        make.log('removing lint cache...');

        try {
            fullpath = make.CLI.expandPath(make.getcfg('cli.lint.cachefile'));
            make.sh.rm('-rf', fullpath);
            resolve();
        } catch (e) {
            reject(e);
        }
    };

}());
