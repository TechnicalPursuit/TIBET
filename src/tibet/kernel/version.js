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
        semver: '5.2.4+g1180989c6d.35.1611503045798',
        major: '5',
        minor: '2',
        patch: '4',
        suffix: '',
        increment: '0',
        time: '1611503045798',
        //  prior semver
        describe: '5.2.3-develop-35-g1180989c6d',
        ptag: '5.2.3-develop',
        commits: '35',
        phash: '1180989c6d'
    },
    'lib');

}());
