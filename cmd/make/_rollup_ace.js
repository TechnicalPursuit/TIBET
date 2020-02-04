(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update ace-builds');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'ace-builds'));

        make.sh.mkdir(
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'ace.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace', 'ace-tpi.js'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'mode-javascript.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'worker-javascript.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'mode-jsx.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'mode-css.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'worker-css.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'mode-xml.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'worker-xml.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'mode-json.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'worker-json.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'src-min-noconflict', 'theme-dawn.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'ace'));

        resolve();
    };

}());
