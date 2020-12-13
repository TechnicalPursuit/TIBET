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
        semver: '5.2.1+g5acb1d73b8.9.1607872089830',
        major: '5',
        minor: '2',
        patch: '1',
        suffix: '',
        increment: '0',
        time: '1607872089830',
        //  prior semver
        describe: '5.2.0-9-g5acb1d73b8',
        ptag: '5.2.0',
        commits: '9',
        phash: '5acb1d73b8'
    },
    'lib');

}());
