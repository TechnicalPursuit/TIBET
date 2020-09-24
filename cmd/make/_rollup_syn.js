(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir,

            destPath,
            content;

        npmdir = make.CLI.expandPath('~npm_dir');
        make.sh.cd(make.CLI.joinPaths(npmdir, 'syn'));

        destPath = make.CLI.joinPaths('..', '..', 'deps', 'syn-tpi.js');

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'global', 'syn.js'),
            destPath);

        content = make.sh.cat(destPath).toString();
        content = 'if (TP.sys.inExtension() !== true)' +
                    ' {\n(function() {\n' + content + '\n}());\n}';
        new make.sh.ShellString(content).to(destPath);

        resolve();
    };

}());
