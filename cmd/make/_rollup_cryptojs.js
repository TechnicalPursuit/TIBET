(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var npmdir;

        make.sh.exec('bower install cryptojslib');

        make.sh.cd('bower_components/cryptojslib');

        make.sh.exec('mkdir ../../deps/cryptojs');

        make.sh.exec('cp -f -R components/core.js ../../deps/cryptojs/CryptoJS-core-tpi.js');
        make.sh.exec('cp -f -R components/md5.js ../../deps/cryptojs/CryptoJS-md5-tpi.js');
        make.sh.exec('cp -f -R components/sha1.js ../../deps/cryptojs/CryptoJS-sha1-tpi.js');
        make.sh.exec('cp -f -R components/enc-base64.js ../../deps/cryptojs/CryptoJS-enc-base64-tpi.js');
        make.sh.exec('cp -f -R components/cipher-core.js ../../deps/cryptojs/CryptoJS-cipher-core-tpi.js');
        make.sh.exec('cp -f -R components/format-hex.js ../../deps/cryptojs/CryptoJS-format-hex-tpi.js');

        resolve();
    };

}());
