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
        semver: '5.2.6+g0df6f70f4b.118.1617937302882',
        major: '5',
        minor: '2',
        patch: '6',
        suffix: '',
        increment: '0',
        time: '1617937302882',
        //  prior semver
        describe: '5.2.5-118-g0df6f70f4b',
        ptag: '5.2.5',
        commits: '118',
        phash: '0df6f70f4b'
    },
    'lib');

}());
