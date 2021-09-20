(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm install @codemirror/state');
        make.sh.exec('npm install @codemirror/view');
        make.sh.exec('npm install @codemirror/text');
        make.sh.exec('npm install @codemirror/rangeset');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, '@codemirror/view'));

        //  Need to get style-mod
        make.sh.exec('npm install style-mod');

        //  Need to get w3c-keyname
        make.sh.exec('npm install w3c-keyname');

        //  Since CodeMirror 6 uses ECMA modules, it will be included via
        //  entries in the cfg.xml and packaged when the app is packaged.

        resolve();
    };

}());
