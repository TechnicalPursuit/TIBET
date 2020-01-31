(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jquery-xpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'jquery-xpath'));

        make.sh.cp(
            make.path.join('.', 'jquery.xpath.js'),
            make.path.join('..', '..', 'deps', 'jquery.xpath-tpi.js'));

        make.sh.cp(
            make.path.join('.', 'jquery.xpath.min.js'),
            make.path.join('..', '..', 'deps', 'jquery.xpath-tpi.min.js'));

        resolve();
    };

}());
