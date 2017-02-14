(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('removing build artifacts...');

        make.task('clean_docs')().then(
        function() {
            var fullpath;

            fullpath = make.path.join(make.CLI.expandPath('~'), 'lib', 'src');
            if (make.sh.test('-d', fullpath)) {
                make.sh.rm('-rf', make.path.join(fullpath, '*'));
            }
        }).then(resolve, reject);
    };

}());
