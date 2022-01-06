(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.log('\n\nrolling up discoveryjs...\n\n');

        make.sh.exec('npm update @discoveryjs/discovery');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, '@discoveryjs', 'discovery', 'dist'));

        make.sh.mkdir(
            make.CLI.joinPaths('..', '..', '..', '..', 'deps', 'discovery'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'discovery.css'),
            make.CLI.joinPaths('..', '..', '..', '..', 'deps', 'discovery', 'discovery.css'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'discovery.js'),
            make.CLI.joinPaths('..', '..', '..', '..', 'deps', 'discovery', 'discovery-tpi.min.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'discovery-preloader.js'),
            make.CLI.joinPaths('..', '..', '..', '..', 'deps', 'discovery', 'discovery-preloader-tpi.min.js'));

        make.sh.cd(make.CLI.joinPaths('..', '..', 'json-ext', 'dist'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'json-ext.min.js'),
            make.CLI.joinPaths('..', '..', '..', '..', 'deps', 'discovery', 'json-ext-tpi.min.js'));

        resolve();
    };

}());
