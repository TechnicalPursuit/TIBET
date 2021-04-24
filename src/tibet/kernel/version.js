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
        semver: '5.3.0+g9cc62ca3b0.24.1619109762591',
        major: '5',
        minor: '3',
        patch: '0',
        suffix: '',
        increment: '0',
        time: '1619109762591',
        //  prior semver
        describe: '5.2.7-24-g9cc62ca3b0',
        ptag: '5.2.7',
        commits: '24',
        phash: '9cc62ca3b0'
    },
    'lib');

}());
