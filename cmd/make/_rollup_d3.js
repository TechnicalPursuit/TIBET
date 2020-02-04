(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        npmdir = make.CLI.expandPath('~npm_dir');

        make.sh.exec('npm update d3-selection');
        make.sh.exec('npm update d3-interpolate');
        make.sh.exec('npm update d3-dispatch');

        make.sh.cd(make.CLI.joinPaths(npmdir, 'd3-selection'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'd3-selection.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'd3-selection-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'd3-selection.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'd3-selection-tpi.min.js'));

        make.sh.cd('../d3-interpolate');

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'd3-interpolate.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'd3-interpolate-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'd3-interpolate.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'd3-interpolate-tpi.min.js'));

        make.sh.cd('../d3-dispatch');

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'd3-dispatch.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'd3-dispatch-tpi.js'));

        make.sh.cp(
            make.CLI.joinPaths('.', 'dist', 'd3-dispatch.min.js'),
            make.CLI.joinPaths('..', '..', 'deps', 'd3-dispatch-tpi.min.js'));

        resolve();
    };

}());
