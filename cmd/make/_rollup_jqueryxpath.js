(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update jquery-xpath');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'jquery-xpath'));

        make.sh.exec('cp -f ./jquery.xpath.js ../../deps/jquery.xpath-tpi.js');
        make.sh.exec(
            'cp -f ./jquery.xpath.min.js ../../deps/jquery.xpath-tpi.min.js');

        resolve();
    };

}());
