(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm install @codemirror/basic-setup');
        make.sh.exec('npm install @codemirror/lang-javascript');

        make.sh.exec('npm install @codemirror/panel');

        make.sh.exec('npm install @codemirror/theme-one-dark');

        //  ---

        npmdir = make.CLI.expandPath('~npm_dir');

        make.sh.cd(make.CLI.joinPaths(npmdir, '@codemirror/view'));

        make.sh.exec('npm install style-mod');
        make.sh.exec('npm install w3c-keyname');


        //  ---

        make.sh.cd(make.CLI.joinPaths('..', '..', '@codemirror/language'));

        make.sh.exec('npm install @lezer/common');
        make.sh.exec('npm install @lezer/lr');
        make.sh.exec('npm install @lezer/javascript');

        //  ---

        make.sh.cd(make.CLI.joinPaths('..', '..', '@codemirror/search'));

        make.sh.exec('npm install crelt');

        //  Since CodeMirror 6 uses ECMA modules, it will be included via
        //  entries in the cfg.xml and packaged when the app is packaged.

        resolve();
    };

}());
