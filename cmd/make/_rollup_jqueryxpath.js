(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jquery-xpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'jquery-xpath'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'jquery.xpath.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'jquery.xpath-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'jquery.xpath.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'jquery.xpath-tpi.min.js'));

        resolve();
    };

}());
