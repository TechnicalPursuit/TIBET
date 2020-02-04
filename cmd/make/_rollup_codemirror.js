(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('npm update codemirror');

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'codemirror'));

        make.sh.mkdir(
            make.CLI.joinPaths('..', '..', 'deps', 'codemirror'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'lib'),
            make.CLI.joinPaths('..', '..', 'deps', 'codemirror'));

        make.sh.mkdir(
            make.CLI.joinPaths('..', '..', 'deps', 'codemirror', 'mode'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'mode', 'javascript'),
            make.CLI.joinPaths('..', '..', 'deps', 'codemirror', 'mode'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'mode', 'xml'),
            make.CLI.joinPaths('..', '..', 'deps', 'codemirror', 'mode'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'mode', 'css'),
            make.CLI.joinPaths('..', '..', 'deps', 'codemirror', 'mode'));

        make.sh.mkdir(
            make.CLI.joinPaths('..', '..', 'deps', 'codemirror', 'addon'));

        make.sh.mkdir(
            make.CLI.joinPaths(
                '..', '..', 'deps', 'codemirror', 'addon', 'runmode'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'addon', 'runmode', 'runmode.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'codemirror', 'addon', 'runmode'));

        resolve();
    };

}());
