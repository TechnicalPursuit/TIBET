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
        srcpath = make.CLI.joinPaths(root, 'lib', 'src',
            'tibet_service_worker.min.js');

        if (make.sh.test('-e', srcpath)) {
            targets.forEach(function(target) {
                var dest,
                    parts;

                parts = target;
                parts.unshift(root);
                dest = make.CLI.joinPaths.apply(make.CLI, parts);
                dest = dest + '/';

                make.sh.cp('-r', srcpath, dest);
            });
        }

        resolve();
    };

}());
