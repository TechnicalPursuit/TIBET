(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.log('\n\nrolling up wicked-good-xpath...\n\n');

        make.sh.exec('npm update wicked-good-xpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'wicked-good-xpath'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'wgxpath.install.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'wgxpath-tpi.install.min.js'));

        resolve();
    };

}());
