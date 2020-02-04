(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {

        make.sh.exec('bower install cryptojslib');

        make.sh.cd('bower_components/cryptojslib');

        make.sh.mkdir(
            make.CLI.joinPaths('..', '..', 'deps', 'cryptojs'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'components', 'core.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-core-tpi.js'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'components', 'md5.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-md5-tpi.js'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'components', 'sha1.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-sha1-tpi.js'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'components', 'enc-base64.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-enc-base64-tpi.js'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'components', 'cipher-core.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-cipher-core-tpi.js'));

        make.sh.cp(
            '-R',
            make.CLI.joinPaths('.', 'components', 'format-hex.js'),
            make.CLI.joinPaths(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-format-hex-tpi.js'));

        resolve();
    };

}());
