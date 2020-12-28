(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {

        var CLI,
            sh,

            clonedir,
            cryptodepsdir;

        CLI = make.CLI;
        sh = make.sh;

        clonedir = sh.tempdir();
        sh.cd(clonedir);

        sh.rm('-rf', 'CryptoJS');

        sh.exec('git clone https://github.com/sytelus/CryptoJS.git');
        sh.cd('CryptoJS');
        clonedir = sh.pwd().toString();

        cryptodepsdir = CLI.joinPaths(CLI.getLibRoot(), 'deps', 'cryptojs');

        if (!sh.test('-d', cryptodepsdir)) {
            sh.mkdir(cryptodepsdir);
        }

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir, 'components', 'core.js'),
            CLI.joinPaths(cryptodepsdir, 'CryptoJS-core-tpi.js'));

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir, 'components', 'md5.js'),
            CLI.joinPaths(cryptodepsdir, 'CryptoJS-md5-tpi.js'));

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir, 'components', 'sha1.js'),
            CLI.joinPaths(cryptodepsdir, 'CryptoJS-sha1-tpi.js'));

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir, 'components', 'enc-base64.js'),
            CLI.joinPaths(cryptodepsdir, 'CryptoJS-enc-base64-tpi.js'));

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir, 'components', 'cipher-core.js'),
            CLI.joinPaths(cryptodepsdir, 'CryptoJS-cipher-core-tpi.js'));

        sh.cp(
            '-R',
            CLI.joinPaths(clonedir, 'components', 'format-hex.js'),
            CLI.joinPaths(cryptodepsdir, 'CryptoJS-format-hex-tpi.js'));

        resolve();
    };

}());
