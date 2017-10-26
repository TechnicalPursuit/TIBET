(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update ace-builds');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'ace-builds'));

        make.sh.exec('npm install -d');

        make.sh.exec('mkdir ../../deps/ace');
        make.sh.exec('cp -f -R src-min-noconflict/ace.js ../../deps/ace/ace-tpi.js');

        make.sh.exec('cp -f -R src-min-noconflict/mode-javascript.js ../../deps/ace');
        make.sh.exec('cp -f -R src-min-noconflict/worker-javascript.js ../../deps/ace');
        make.sh.exec('cp -f -R src-min-noconflict/mode-css.js ../../deps/ace');
        make.sh.exec('cp -f -R src-min-noconflict/worker-css.js ../../deps/ace');

        make.sh.exec('cp -f -R src-min-noconflict/mode-xml.js ../../deps/ace');
        make.sh.exec('cp -f -R src-min-noconflict/worker-xml.js ../../deps/ace');

        make.sh.exec('cp -f -R src-min-noconflict/mode-json.js ../../deps/ace');
        make.sh.exec('cp -f -R src-min-noconflict/worker-json.js ../../deps/ace');

        make.sh.exec('cp -f -R src-min-noconflict/theme-dawn.js ../../deps/ace');

        resolve();
    };

}());
