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
        semver: '5.6.1+g6008065088.266.1652652693113',
        major: '5',
        minor: '6',
        patch: '1',
        suffix: '',
        increment: '0',
        time: '1652652693113',
        //  prior semver
        describe: '5.6.0-266-g6008065088',
        ptag: '5.6.0',
        commits: '266',
        phash: '6008065088'
    },
    'lib');

}());
