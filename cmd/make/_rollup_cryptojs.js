(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {

        make.sh.exec('bower install cryptojslib');

        make.sh.cd('bower_components/cryptojslib');

        make.sh.mkdir(
            make.path.join('..', '..', 'deps', 'cryptojs'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'components', 'core.js'),
            make.path.join(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-core-tpi.js'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'components', 'md5.js'),
            make.path.join(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-md5-tpi.js'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'components', 'sha1.js'),
            make.path.join(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-sha1-tpi.js'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'components', 'enc-base64.js'),
            make.path.join(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-enc-base64-tpi.js'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'components', 'cipher-core.js'),
            make.path.join(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-cipher-core-tpi.js'));

        make.sh.cp(
            '-R',
            make.path.join('.', 'components', 'format-hex.js'),
            make.path.join(
                '..', '..', 'deps', 'cryptojs', 'CryptoJS-format-hex-tpi.js'));

        resolve();
    };

}());
