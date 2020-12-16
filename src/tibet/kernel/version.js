//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

(function() {
    'use strict';

    var release;

    release = TP && TP.sys && TP.sys.release ? TP.sys.release :
        (data) => {
            module.exports = data;
        };

    release({
        //  new release
        semver: '5.2.2+gc2c2bfba3d.20.1608089811785',
        major: '5',
        minor: '2',
        patch: '2',
        suffix: '',
        increment: '0',
        time: '1608089811785',
        //  prior semver
        describe: '5.2.1-develop-20-gc2c2bfba3d-dirty',
        ptag: '5.2.1-develop',
        commits: '20',
        phash: 'c2c2bfba3d'
    },
    'lib');

}());
