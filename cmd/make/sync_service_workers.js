(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var root,
            srcpath,
            targets;

        make.log('syncing service workers...');

        targets = [
            ['dna', 'default', 'public'],
            ['dna', 'couch', 'public']
        ];

        root = make.CLI.expandPath('~');
        srcpath = make.path.join(root, 'lib', 'src',
            'tibet_service_worker.min.js');

        if (make.sh.test('-e', srcpath)) {
            targets.forEach(function(target) {
                var dest,
                    parts;

                parts = target;
                parts.unshift(root);
                dest = make.path.join.apply(make.path, parts);
                dest = dest + make.path.sep;

                make.sh.cp('-rf', srcpath, dest);
            });
        }

        resolve();
    };

}());
