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
        srcpath = make.path.join(root, 'lib', 'styles');
        srcpath = srcpath + make.path.sep;

        if (make.sh.test('-d', srcpath)) {
            targets.forEach(function(target) {
                var dest,
                    parts;

                parts = target;
                parts.unshift(root);
                parts = parts.concat(['TIBET-INF', 'boot', 'styles']);
                dest = make.path.join.apply(make.path, parts);
                dest = dest + make.path.sep;

                make.log(dest);
                make.sh.cp('-rf', srcpath, dest);
            });
        }

        resolve();
    };

}());
