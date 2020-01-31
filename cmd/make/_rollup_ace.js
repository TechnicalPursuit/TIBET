(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update ace-builds');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'ace-builds'));

        make.sh.mkdir(
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'ace.js'),
            make.path.join('..', '..', 'deps', 'ace', 'ace-tpi.js'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'mode-javascript.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'worker-javascript.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'mode-jsx.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'mode-css.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'worker-css.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'mode-xml.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'worker-xml.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'mode-json.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'worker-json.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'src-min-noconflict', 'theme-dawn.js'),
            make.path.join('..', '..', 'deps', 'ace'));

        resolve();
    };

}());
