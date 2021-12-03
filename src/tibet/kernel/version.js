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
        semver: '5.6.0+g0f0b267af2.106.1638563905700',
        major: '5',
        minor: '6',
        patch: '0',
        suffix: '',
        increment: '0',
        time: '1638563905700',
        //  prior semver
        describe: '5.5.0-106-g0f0b267af2',
        ptag: '5.5.0',
        commits: '106',
        phash: '0f0b267af2'
    },
    'lib');

}());
