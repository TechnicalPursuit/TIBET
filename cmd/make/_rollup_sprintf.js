(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update sprintf-js');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'sprintf-js'));

        make.sh.cp(
            make.path.join('.', 'src', 'sprintf.js'),
            make.path.join('..', '..', 'deps', 'sprintf-tpi.js'));

        make.sh.sed('-i',
                    /\/\/# sourceMappingURL/g,
                    '\n//**no source maps!**',
                    './dist/sprintf.min.js');

        make.sh.cp(make.path.join('.', 'dist', 'sprintf.min.js'),
                    make.path.join('..', '..', 'deps', 'sprintf-tpi.min.js'));

        //  (ss) commented out. Devtools lies about initiator when map file is
        //  present saying code loaded because of sprintf. Yeah right. 404 is less
        //  of an issue than failing to let you see the true source of file loads.
        //
        //  NOTE we copy the map file since it'll 404 on us otherwise. And don't use
        //  tpi in the name, the lookup ends up explicit to the original name.
        //  make.sh.exec('cp -f ./dist/sprintf.min.js.map ../../deps/sprintf.min.js.map');
        //  make.sh.exec('cp -f ./dist/sprintf.min.js.map ../../lib/src/sprintf.min.js.map');

        resolve();
    };

}());
