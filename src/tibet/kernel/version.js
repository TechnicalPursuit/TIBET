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
        semver: '5.3.5+gebd2e29a4b.19.1620134646103',
        major: '5',
        minor: '3',
        patch: '5',
        suffix: '',
        increment: '0',
        time: '1620134646103',
        //  prior semver
        describe: '5.3.4-19-gebd2e29a4b',
        ptag: '5.3.4',
        commits: '19',
        phash: 'ebd2e29a4b'
    },
    'lib');

}());
