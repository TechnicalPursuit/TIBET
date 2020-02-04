(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('removing build artifacts...');

        make.task('clean_docs')().then(
        function() {
            var fullpath;

            fullpath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'lib', 'src');
            if (make.sh.test('-d', fullpath)) {
                make.sh.rm('-rf', make.CLI.joinPaths(fullpath, '*'));
            }
        }).then(resolve, reject);
    };

}());
