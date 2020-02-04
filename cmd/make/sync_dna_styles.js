(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var root,
            srcpath,
            targets;

        make.log('syncing dna styles...');

        targets = [
            ['dna', 'default', 'public'],
            ['dna', 'couch', 'public'],
            ['dna', 'ghpages'],
            ['dna', 'electron']
        ];

        root = make.CLI.expandPath('~');
        srcpath = make.CLI.joinPaths(root, 'lib', 'styles');
        srcpath = srcpath + '/';

        if (make.sh.test('-d', srcpath)) {
            targets.forEach(function(target) {
                var dest,
                    parts;

                parts = target;
                parts.unshift(root);
                parts = parts.concat(['TIBET-INF', 'boot', 'styles']);
                dest = make.CLI.joinPaths.apply(make.CLI, parts);
                dest = dest + '/';

                make.log(dest);
                make.sh.cp('-r', make.CLI.joinPaths(srcpath, '*'), dest);
            });
        }

        resolve();
    };

}());
