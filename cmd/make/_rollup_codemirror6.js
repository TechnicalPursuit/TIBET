(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm install @codemirror/basic-setup');
        make.sh.exec('npm install @codemirror/lang-css');
        make.sh.exec('npm install @codemirror/lang-html');
        make.sh.exec('npm install @codemirror/lang-javascript');
        make.sh.exec('npm install @codemirror/lang-json');
        make.sh.exec('npm install @codemirror/lang-markdown');
        make.sh.exec('npm install @codemirror/lang-python');
        make.sh.exec('npm install @codemirror/lang-xml');

        make.sh.exec('npm install @codemirror/panel');

        //  ---

        npmdir = make.CLI.expandPath('~npm_dir');

        make.sh.cd(make.CLI.joinPaths(npmdir, '@codemirror/view'));

        make.sh.exec('npm install style-mod');
        make.sh.exec('npm install w3c-keyname');


        //  ---

        make.sh.cd(make.CLI.joinPaths('..', '..', '@codemirror/language'));

        make.sh.exec('npm install @lezer/common');
        make.sh.exec('npm install @lezer/lr');

        make.sh.exec('npm install @lezer/css');
        make.sh.exec('npm install @lezer/html');
        make.sh.exec('npm install @lezer/javascript');
        make.sh.exec('npm install @lezer/json');
        make.sh.exec('npm install @lezer/markdown');
        make.sh.exec('npm install @lezer/python');
        make.sh.exec('npm install @lezer/xml');

        //  ---

        make.sh.cd(make.CLI.joinPaths('..', '..', '@codemirror/search'));

        make.sh.exec('npm install crelt');

        //  Since CodeMirror 6 uses ECMA modules, it will be included via
        //  entries in the cfg.xml and packaged when the app is packaged.

        resolve();
    };

}());
