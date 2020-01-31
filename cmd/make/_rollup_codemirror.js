(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update codemirror');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.path.join(npmdir, 'codemirror'));

        make.sh.mkdir(
            make.path.join('..', '..', 'deps', 'codemirror'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'lib'),
            make.path.join('..', '..', 'deps', 'codemirror'));

        make.sh.mkdir(
            make.path.join('..', '..', 'deps', 'codemirror', 'mode'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'mode', 'javascript'),
            make.path.join('..', '..', 'deps', 'codemirror', 'mode'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'mode', 'xml'),
            make.path.join('..', '..', 'deps', 'codemirror', 'mode'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'mode', 'css'),
            make.path.join('..', '..', 'deps', 'codemirror', 'mode'));

        make.sh.mkdir(
            make.path.join('..', '..', 'deps', 'codemirror', 'addon'));

        make.sh.mkdir(
            make.path.join(
                '..', '..', 'deps', 'codemirror', 'addon', 'runmode'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'addon', 'runmode', 'runmode.js'),
            make.path.join(
                '..', '..', 'deps', 'codemirror', 'addon', 'runmode'));

        resolve();
    };

}());
